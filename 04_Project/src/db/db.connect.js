import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const dbConnection = await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
        console.log(`DB connected successfully to ${dbConnection.connection.host}`)
    } catch (error) {
        console.error("couldn't connect to db", error)
        process.exit(1)
    }
}

export default connectDB