import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.upload.js";
import  {Video} from "../models/video.models.js"

const publishVideo = asyncHandler(async(req, res) => {
    const {title, description} = req.body;
    if(!title && !description){
        throw new ApiError(400, "Provide a title along with description")
    }

    const user = await User.findById(req.user._id)
    if(!user){
        throw new ApiError(400, "You have to be loggedIn to publish video")
    }

    const videoPath = req.files?.videoFile[0]?.path
    const thumbnailPath = req.files?.thumbnail[0]?.path
    const uploadedVideo = await uploadToCloudinary(videoPath)
    const uploadedThumbnail = await uploadToCloudinary(thumbnailPath)

    if(!uploadedVideo && !uploadedThumbnail){
        throw new ApiError(500, "Failed to upload files to cloudinary")
    }

    const video = await Video.create({
        title,
        description,
        duration: uploadedVideo.duration,
        videoFile: uploadedVideo.secure_url,
        thumbnail: uploadedThumbnail.secure_url,
        owner: req.user._id,
        isPublished: false
    })

    const videoUploaded = await Video.findById(video._id);
    if(!videoUploaded){
        throw new ApiError(500, "Failed to upload video to DB")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video uploaded Succefully"))


})

// const getVideoById = asyncHandler(async(req, res) => {
//     const {videoId} = req.params;
//     if(!isValidObjectId(videoId)){
//         throw new ApiError(400, "Provide a valid video id")
//     }

//     const video = await Video.findById(videoId);
//     if(!video){
//         throw new ApiError(404, "Video not found")
//     }
    
//     return res
//         .status(200)
//         .json(new ApiResponse(200, video, "Successfully fetched video"))
// })

const deleteVideo = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Provide a valid video id")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(video?.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400, "Only owner can delete their video")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if(!deletedVideo){
        throw new ApiError(500, "Failed to delete video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Provide a valid video id")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(video?.owner.toString() !== req.user?._id?.toString()){
        throw new ApiError(400, "Only owner can toggle their video")
    }

    video.isPublished = !video.isPublished;
    const updatedVideo = await video.save({validateBeforeSave: false});

    if(!updatedVideo){
        throw new ApiError(500, "Failed to update video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"))
})

const updateVideo = asyncHandler(async(req, res) => {
    
})

const getAllVideos = asyncHandler(async (req, res) => {})

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

