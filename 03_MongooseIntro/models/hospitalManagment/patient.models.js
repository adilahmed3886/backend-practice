import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    age: {
        type: Number,
        required: true
    },

    gender: {
        type: String,
        enum: ['male', 'female'],
        required: true
    },

    address: {
        type: String,
        required: true
    },

    bloodGroup: {
        type: String,
        required: true
    },

    diagnosedWith: {
        type: String,
        required: true
    },

    admittedIn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital'
    },
    
    // medicalRecord: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'MedicalRecord'
    // },

    phoneNumber: {
        type: String
    }
}, {timestamps: true})

export const Patient = mongoose.model('Patient', patientSchema)