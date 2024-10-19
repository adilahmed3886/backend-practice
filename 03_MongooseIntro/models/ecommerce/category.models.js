import mongoose from "mongoose";

const  userSchemea = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
}, {timestamps: true})

export const Category = mongoose.model('Category', userSchemea)