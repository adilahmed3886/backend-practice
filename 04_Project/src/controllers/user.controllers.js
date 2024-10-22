import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {uploadToCloudinary} from "../utils/cloudinary.upload.js";

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
    if(req.files && req.files.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImagePath = req.files.coverImage[0].path
    }
    if(!avatarPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatarRes = await uploadToCloudinary(avatarPath)
    const coverImageRes = await uploadToCloudinary(coverImagePath)
    if(!avatarRes){
        throw new ApiError(400, "Avatar upload failed")
    }

    const newUser = await User.create({
        username,
        fullName,
        email,
        password,
        avatar: avatarRes.secure_url,
        coverImage: coverImageRes.secure_url
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(400, "User creation failed")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User created successfully"))


})

export {registerUser}