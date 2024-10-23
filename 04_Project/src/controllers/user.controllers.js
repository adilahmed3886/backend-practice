import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {uploadToCloudinary} from "../utils/cloudinary.upload.js";

const generateAccessAndRefreshToken = async (id) => {
    try {
        const user = await User.findById(id)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Failed to create tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user info which are needed to make user model
    //verify the info
    //check if user already exists
    //verify password
    //get avatar and cover images
    //upload to cloudinary
    //make user object
    //save the files inside the user object
    //create user
    //remove password and refresh token from response user
    //verify created user
    //return response

    const {username, fullName, email, password} = req.body
    if(!(username && fullName && email && password)){
        throw new ApiError(400, "All fields are required")
    }
    if(password.length < 8){
        throw new ApiError(400, "Password must be at least 8 characters")
    }

    const existingUser = await User.findOne({$or: [{username}, {email}]})
    if(existingUser){
        throw new ApiError(400, "User already exists")
    }

    const avatarPath = req.files?.avatar[0]?.path
    let coverImagePath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImagePath = req.files.coverImage[0].path
    }
    if(!avatarPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadToCloudinary(avatarPath)
    const coverImage = await uploadToCloudinary(coverImagePath)
    if(!avatar){
        throw new ApiError(400, "Avatar upload failed")
    }

    const newUser = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage?.secure_url || "",
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(400, "User creation failed")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User created successfully"))


})

const loginUser = asyncHandler(async (req, res) => {
    //get username and password from req.body
    //check if username and password are valid
    //check if user exists
    //check if password is correct
    //generate access token
    //generate refresh token
    //remove password and refresh token from response user
    //add tokens in cookies as response headers
    //return response
    const {email, password} = req.body
    if(!(password && email)){
        throw new ApiError(400, "email and password both is required")
    }
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(400, "User does not exist")
    }
    const passwordCheck = await user.checkPassword(password)
    if(!passwordCheck){
        throw new ApiError(400, "Incorrect password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    if(!loggedInUser){
        throw new ApiError(500, "Login Failed!")
    }

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, loggedInUser, "User logged in successfully"))
    
})



export {
    registerUser,
    loginUser,
}