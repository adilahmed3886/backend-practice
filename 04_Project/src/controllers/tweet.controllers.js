import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {Tweet} from "../models/tweet.models.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content.trim()){
        throw new ApiError(400, "Provide a valid content")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if(!tweet){
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, createTweet, "Successfully created tweet"))


})

const updateTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const { tweetId } = req.params;

    if (!content?.trim()) {
        throw new ApiError(400, "Provide valid content");
    }

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Provide valid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Only owner can edit thier tweet");
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
            },
        },
        { new: true }
    );

    if (!newTweet) {
        throw new ApiError(500, "Failed to edit tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, newTweet, "Successfully updated tweet"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Provide valid tweet id");
    }

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet?.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, "Only owner can delete thier tweet");
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(500, "Failed to delete tweet");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedTweet, "Successfully deleted tweet"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    
})
export {createTweet, getUserTweets, updateTweet, deleteTweet}