import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { accessTokenRefresh, changePassword, getCurrentUser, loginUser, logoutUser, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controllers.js";
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
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refreshTokens").post(accessTokenRefresh)
router.route("/changePassword").post(verifyJWT, changePassword)
router.route("/getUser").get(verifyJWT, getCurrentUser)
router.route("/updateUser").patch(verifyJWT, updateAccountDetails)

router.route("/updateAvatar").patch(upload.single("avatar"), verifyJWT, updateAvatar)
router.route("/updateCoverImage").patch(upload.single("coverImage"), verifyJWT, updateCoverImage)



export default router