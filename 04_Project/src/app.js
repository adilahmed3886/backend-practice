import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({origin: process.env.cors_ORIGIN, credentials: true}))
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js"

app.use("/api/v2/users", userRouter);
app.use("/api/v2/videos", videoRouter);

export default app;
