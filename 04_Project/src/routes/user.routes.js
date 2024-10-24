import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {name: "avatar", maxCount: 1},
        {name: "coverImage", maxCount: 1}
    ]),
    registerUser
)
router.route("/login").post(loginUser);

//secured routes:
router.route("/logout").get(verifyJWT, logoutUser);

export default router