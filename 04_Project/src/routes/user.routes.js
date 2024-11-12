import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { accessTokenRefresh, changePassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, registerUser, updateAccountDetails, updateAvatar, updateCoverImage } from "../controllers/user.controllers.js";
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
router.route("/refresh-tokens").post(accessTokenRefresh)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/get-user").get(verifyJWT, getCurrentUser)
router.route("/update-user").patch(verifyJWT, updateAccountDetails)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/channel-profile/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistory)


export default router