import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { addComment, createPost, deleteComment, deletePost, getCommunityPosts, reportPost, toggleLike } from "../controllers/postControllers.js";
import { upload } from "../middlewares/multer.js";


const postRouter = express.Router();

postRouter.post("/create-post/:communityId", isAuth, upload.single("mediaFile"), createPost);
postRouter.get("/get-community-posts/:communityId", isAuth, getCommunityPosts);
postRouter.delete("/delete-post/:postId", isAuth, deletePost);
postRouter.put("/like/:postId", isAuth, toggleLike);
postRouter.post("/add-comment/:postId", isAuth, addComment);
postRouter.delete("/delete-comment/:postId/:commentId", isAuth, deleteComment);
postRouter.post("/report/:postId", isAuth, reportPost);


export default postRouter;