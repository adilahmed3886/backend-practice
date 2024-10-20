import dotenv from 'dotenv'
import app from "./app.js";
import connectDB from './db/db.connect.js';

dotenv.config({ path: './.env' })

const port = process.env.PORT || 4000

connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`)
        })
        app.on('error', (error) => {
            console.log("server error, couldn't start server", error)
        })
    })
    .catch((error) => {
        console.log("couldn't connect to db", error)
    })
