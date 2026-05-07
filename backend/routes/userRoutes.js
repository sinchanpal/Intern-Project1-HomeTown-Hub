import express from "express";
import { getCurrentUser } from "../controllers/userControllers.js";
import { isAuth } from "../middlewares/isAuth.js";

const userRouter = express.Router();

userRouter.get("/getCurrentUser", isAuth, getCurrentUser);

export default userRouter;