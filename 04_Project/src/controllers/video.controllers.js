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

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    console.log(userId);
    const pipeline = [];

    // for using Full Text based search u need to create a search index in mongoDB atlas
    // you can include field mapppings in search index eg.title, description, as well
    // Field mappings specify which fields within your documents should be indexed for text search.
    // this helps in seraching only in title, desc providing faster search results
    // here the name of search index is 'search-videos'
    if (query) {
        pipeline.push({
            $search: {
                index: "search-videos",
                text: {
                    query: query,
                    path: ["title", "description"] //search only on title, desc
                }
            }
        });
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }

        pipeline.push({
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        });
    }

    // fetch videos only that are set isPublished as true
    pipeline.push({ $match: { isPublished: true } });

    //sortBy can be views, createdAt, duration
    //sortType can be ascending(-1) or descending(1)
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    )

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}

