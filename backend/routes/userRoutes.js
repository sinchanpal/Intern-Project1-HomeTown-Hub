import express from "express";
import { deleteNotification, getCurrentUser, getMyNotifications, getUserProfile, markNotificationsAsRead, updateUserProfile } from "../controllers/userControllers.js";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.get("/getCurrentUser", isAuth, getCurrentUser);
userRouter.get("/profile/:userId", isAuth, getUserProfile);
userRouter.put("/edit-profile", isAuth, upload.single("profilePicture"), updateUserProfile);
userRouter.get("/notifications", isAuth, getMyNotifications);
userRouter.put("/notifications/mark-read", isAuth, markNotificationsAsRead);
userRouter.delete("/notifications/delete/:notificationId", isAuth, deleteNotification);

export default userRouter;