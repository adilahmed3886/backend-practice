import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {uploadToCloudinary} from "../utils/cloudinary.upload.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (id) => {
    try {
        const user = await User.findById(id);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to create tokens");
    }
};

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
    const {email, password, username} = req.body
    if(!email && !username){
        throw new ApiError(400, "email or username both is required")
    }
    const user = await User.findOne({$or: [{username}, {email}]})
    if(!user){
        throw new ApiError(404, "User does not exist")
    }
    const passwordCheck = await user.checkPassword(password)
    if(!passwordCheck){
        throw new ApiError(401, "Incorrect password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Token generation failed");
    }
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

const logoutUser = asyncHandler(async (req, res) => {
    const id = req.user._id
    await User.findByIdAndUpdate(id, {$set:{refreshToken: undefined}}, {new: true})

   const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const accessTokenRefresh = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
        if(!incomingRefreshToken){
            throw new ApiError(401, "Refresh token not provided")
        }
        
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decoded?._id)
        if(!user){
            throw new ApiError(404, "Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh Token Provided is Invalid or Expired")
        }
    
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, {accessToken, refreshToken}, "Access Token Refreshed Successfully"))
            
    } catch (error) {
        throw new ApiError(401, error?.message || "Access Token Refresh Failed")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    accessTokenRefresh,
}