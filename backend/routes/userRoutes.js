import express from "express";
import { getCurrentUser, updateUserProfile } from "../controllers/userControllers.js";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/getCurrentUser", isAuth, getCurrentUser);
userRouter.put("/edit-profile", isAuth, upload.single("profilePicture"), updateUserProfile);

export default userRouter;