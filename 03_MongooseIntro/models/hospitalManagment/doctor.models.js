import mongoose from "mongoose";

const worksAtSchema = new mongoose.Schema({
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },

    hours: {
        type: String,
        required: true
    }
})

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    specialization: {
        type: String,
        required: true
    },

    experience: {
        type: Number,
        required: true
    },

    salary: {
        type: Number,
        required: true
    },

    worksAt: {
        type: [worksAtSchema],
        required: true
    }
    
}, {timestamps: true})

export const Doctor = mongoose.model('Doctor', doctorSchema)