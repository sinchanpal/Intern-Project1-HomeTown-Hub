import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createPost, getCommunityPosts } from "../controllers/postControllers.js";


const postRouter = express.Router();

postRouter.post("/create-post/:communityId", isAuth, createPost);
postRouter.get("/get-community-posts/:communityId", isAuth, getCommunityPosts);

export default postRouter;