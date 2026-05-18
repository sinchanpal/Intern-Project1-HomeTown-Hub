import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { addComment, createPost, deletePost, getCommunityPosts, toggleLike } from "../controllers/postControllers.js";
import { upload } from "../middlewares/multer.js";


const postRouter = express.Router();

postRouter.post("/create-post/:communityId", isAuth, upload.single("mediaFile"), createPost);
postRouter.get("/get-community-posts/:communityId", isAuth, getCommunityPosts);
postRouter.delete("/delete-post/:postId", isAuth, deletePost);
postRouter.put("/like/:postId", isAuth, toggleLike);
postRouter.post("/comment/:postId", isAuth, addComment);

export default postRouter;