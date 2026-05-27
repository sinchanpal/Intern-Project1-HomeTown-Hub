import express from "express";
import { createEvent, deleteEvent, getCommunityEvents, toggleRSVP } from "../controllers/eventControllers.js";
import { isAuth } from "../middlewares/isAuth.js";


const eventRouter = express.Router();

// Route to create an event inside a specific community
eventRouter.post("/create-event/:communityId", isAuth, createEvent);
eventRouter.get("/all-community-events/:communityId", isAuth, getCommunityEvents);
eventRouter.put("/rsvp/:eventId", isAuth, toggleRSVP);
eventRouter.delete("/delete-event/:eventId", isAuth, deleteEvent);

export default eventRouter;