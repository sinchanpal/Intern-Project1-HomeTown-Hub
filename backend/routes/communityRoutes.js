import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { createCommunity, editCommunity, getAllCommunities, getMyHubs, getSingleCommunity, joinCommunity } from "../controllers/communityControllers.js";

const communityRouter = express.Router();

communityRouter.post("/create-community", isAuth, createCommunity);
communityRouter.get("/all-communities", isAuth, getAllCommunities);
communityRouter.post("/join-community/:id", isAuth, joinCommunity); //Using a URL parameter (:id) to know WHICH community to join
communityRouter.get("/get-community/:id", isAuth, getSingleCommunity); // route to fetch a specific community by ID
communityRouter.put("/edit-community/:id", isAuth, upload.single("coverImage"), editCommunity); // route to edit community details, with optional cover image upload
communityRouter.get("/my-hubs", isAuth, getMyHubs);  // route to fetch all communities the logged-in user is a member of

export default communityRouter;
