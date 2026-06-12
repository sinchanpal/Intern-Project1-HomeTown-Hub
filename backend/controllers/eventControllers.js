import { userSocketMap } from "../index.js";
import Community from "../models/communityModel.js";
import Event from "../models/eventModel.js";
import Notification from "../models/notificationModel.js";


// Create a new community event
export const createEvent = async (req, res) => {
    try {
        const { communityId } = req.params;
        const { title, description, date, location } = req.body;
        const userId = req.userId; // From your isAuth middleware

        // 1. Basic validation
        if (!title || !date || !location) {
            return res.status(400).json({ message: "Please provide a title, date, and location." });
        }

        // 2. Find the community
        const community = await Community.findById(communityId);
        if (!community) {
            return res.status(404).json({ message: "Community not found." });
        }

        // 3. Security Check: User MUST be a member to create an event
        if (!community.members.includes(userId)) {
            return res.status(403).json({ message: "You must join this community to create events." });
        }

        // 4. Create the event
        const newEvent = await Event.create({
            title,
            description: description || "", // Optional field, default to empty string
            date,
            location,
            community: communityId,
            creator: userId,
            attendees: [userId] // Auto-RSVP the person creating it!
        });

        // 5. Populate the creator's details to show their name/avatar instantly on the frontend
        await newEvent.populate("creator", "name profilePicture");

        // ==========================================
        // NOTIFICATION LOGIC START
        // ==========================================
        const io = req.app.get("io");

        // Notify all members of the community EXCEPT the author of the post
        const notificationPromises = community.members.map(async (memberId) => {
            if (memberId.toString() !== userId.toString()) {
                const newNotif = await Notification.create({
                    recipient: memberId,
                    sender: userId,
                    type: "NEW_EVENT",
                    community: communityId,
                    post: newEvent._id,
                    message: `${newEvent.creator.name} shared a new event in ${community.name}.`
                });

                // If this specific member is online, send it to them instantly!
                const targetSocketId = userSocketMap[memberId.toString()];
                if (targetSocketId) {
                    io.to(targetSocketId).emit("newNotification", newNotif);
                    io.to(targetSocketId).emit("newEvent", newEvent); //send the new event itself so it can appear in real-time on their feed if they're viewing the community
                }
            }
        });

        // Wait for all notifications to finish saving
        await Promise.all(notificationPromises);
        // ==========================================


        return res.status(201).json({
            message: "Event created successfully",
            event: newEvent
        });

    } catch (error) {
        return res.status(500).json({ message: "Error creating event", error: error.message });
    }
};



// Fetch all events for a specific community
export const getCommunityEvents = async (req, res) => {
    try {
        const { communityId } = req.params;

        // Find events, sort by date (closest upcoming events first)
        const events = await Event.find({ community: communityId })
            .populate("creator", "name profilePicture")
            .populate("attendees", "name profilePicture") // Get details of people attending
            .sort({ date: 1 }); // 1 means ascending order (oldest/closest first)

        return res.status(200).json({ events });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

// Toggle RSVP (Join / Leave an Event)
export const toggleRSVP = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        const isAttending = event.attendees.some(id => id.toString() === userId.toString());

        if (isAttending) {
            // Un-RSVP (Remove user from attendees)
            event.attendees = event.attendees.filter(id => id.toString() !== userId.toString());
        } else {
            // RSVP (Add user to attendees)
            event.attendees.push(userId);
        }

        await event.save();

        // Populate attendees again so frontend has names/pictures of the updated list
        await event.populate("attendees", "name profilePicture");

        return res.status(200).json({
            message: isAttending ? "You are no longer attending." : "You have joined the event!",
            attendees: event.attendees
        });

    } catch (error) {
        return res.status(500).json({ message: "Error updating RSVP", error: error.message });
    }
};

// Delete an Event (Creator or Moderator only)
export const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.userId;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found." });

        const community = await Community.findById(event.community);
        if (!community) return res.status(404).json({ message: "Community not found." });

        // RBAC: Is user the event creator or a community moderator?
        const isCreator = event.creator.toString() === userId.toString();
        const isModerator = community.moderators.includes(userId);

        if (!isCreator && !isModerator) {
            return res.status(403).json({ message: "You don't have permission to delete this event." });
        }

        await Event.findByIdAndDelete(eventId);

        return res.status(200).json({ message: "Event deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting event", error: error.message });
    }
};