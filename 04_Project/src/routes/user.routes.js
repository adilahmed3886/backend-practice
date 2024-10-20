import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares";

const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}
    ]),
    //endpoint
)
router.route("/login").post()

export default router