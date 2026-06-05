import Community from "../models/communityModel.js";
import User from "../models/userModel.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { userSocketMap } from "../index.js";
import Notification from "../models/notificationModel.js";

//? This controller handles the creation of a new community hub
export const createCommunity = async (req, res) => {
    try {
        const { name, state, city, description, rules } = req.body;
        const userId = req.userId; // We get this securely from your isAuth middleware!

        // 1. Basic Validation
        if (!name || !state || !city || !description) {
            return res.status(400).json({ message: "Name, state, city, and description are required." });
        }

        // 2. Check for Duplicates
        // We don't want two "Kolkata Tech" groups confusing people
        const existingCommunity = await Community.findOne({ name });
        if (existingCommunity) {
            return res.status(400).json({ message: "A community with this exact name already exists." });
        }

        // 3. Create the Community
        const newCommunity = await Community.create({
            name,
            state,
            city,
            description,
            rules: rules || [], // If they didn't provide rules, just use an empty array
            creator: userId,
            moderators: [userId], // The creator automatically becomes the first Pandit!
            members: [userId]     // The creator is automatically inside the group
        });

        // Return a 201 (Created) status with the new community data
        return res.status(201).json({
            message: "Community created successfully!",
            community: newCommunity
        });

    } catch (error) {
        return res.status(500).json({ message: "Error creating community", error: error.message });
    }
}


//? Fetch a single community by its ID
export const getSingleCommunity = async (req, res) => {
    try {
        const { id } = req.params;

        // We populate the moderators so we know who the Pandits are!
        const community = await Community.findById(id).populate("moderators", "name profilePicture").populate("members", "name profilePicture")
            .populate("pendingMembers", "name profilePicture");

        if (!community) {
            return res.status(404).json({ message: "Community not found" });
        }

        return res.status(200).json({
            message: "Community fetched successfully",
            community
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching community", error: error.message });
    }
};


//? This controller fetches all communities, prioritizing those in the user's location
export const getAllCommunities = async (req, res) => {
    try {
        // 1. Get the current logged-in user to find their location
        const currentUser = await User.findById(req.userId);

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const userCity = currentUser.city;
        const userState = currentUser.state;

        // 2. Fetch communities that EXACTLY match the user's city and state
        const localCommunities = await Community.find({
            city: userCity,
            state: userState
        }).sort({ createdAt: -1 });

        // 3. Fetch a few other communities to show the platform is active 
        // ($ne means "Not Equal", so we don't show their local ones twice)
        const exploreCommunities = await Community.find({
            $or: [
                { city: { $ne: userCity } },
                { state: { $ne: userState } }
            ]
        }).sort({ createdAt: -1 }).limit(10); // Limit to 10 so we don't overload the database

        // 4. Send both lists back to the frontend!
        return res.status(200).json({
            message: "Communities fetched successfully",
            localCommunities,
            exploreCommunities
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error fetching communities",
            error: error.message
        });
    }
}



// User requests to join (Puts them in the waiting room)
export const joinCommunity = async (req, res) => {
    try {
        const communityId = req.params.id;
        const userId = req.userId; // Securely from isAuth

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        //Check if they are ALREADY a member
        if (community.members.includes(userId)) {
            return res.status(400).json({ message: "You are already a member of this community" });
        }

        // Check if they have ALREADY requested to join
        if (community.pendingMembers.includes(userId)) {
            return res.status(400).json({ message: "Your request to join is already pending approval." });
        }

        // Add the user to the pendingMembers array instead of members
        community.pendingMembers.push(userId);
        await community.save();

        // ==========================================
        // NOTIFICATION LOGIC START USING SOCKET.IO
        // ==========================================

        // 1. Fetch the requesting user's name so the notification is friendly
        const requestingUser = await User.findById(userId).select("name");

        const io = req.app.get("io"); // Get the socket server

        // 2. Send a notification to EVERY moderator of this community
        const notificationPromises = community.moderators.map(async (modId) => {
            // Create the database record
            const newNotif = await Notification.create({
                recipient: modId,
                sender: userId,
                type: "JOIN_REQUEST",
                community: communityId,
                message: `${requestingUser.name} has requested to join ${community.name}. Please check Requests tab on Hub Menu to approve or reject.`
            });

            // If this specific moderator is online, send it to their screen instantly!
            const targetSocketId = userSocketMap[modId.toString()];
            if (targetSocketId) {
                io.to(targetSocketId).emit("newNotification", newNotif);
            }
        });

        // Wait for all notifications to finish processing
        await Promise.all(notificationPromises);

        // ==========================================


        return res.status(200).json({
            message: "Join request sent successfully. Waiting for moderator approval.",
            community
        });

    } catch (error) {
        return res.status(500).json({ message: "Error joining community", error: error.message });
    }
};

//? Pandit approves a member
export const approveMember = async (req, res) => {
    try {
        const { communityId, targetUserId } = req.params;
        const panditId = req.userId;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        // Security: Ensure the person making the request is actually a moderator
        if (!community.moderators.includes(panditId)) {
            return res.status(403).json({ message: "Only moderators can approve members." });
        }

        // Remove user from pendingMembers
        community.pendingMembers = community.pendingMembers.filter(id => id.toString() !== targetUserId.toString());

        //Add user to actual members (if not already there)
        if (!community.members.includes(targetUserId)) {
            community.members.push(targetUserId);
        }

        await community.save();

        // ==========================================
        //  NOTIFICATION LOGIC START USING SOCKET.IO
        // ==========================================

        // Save it to the database so it is waiting for them when they log in
        const newNotification = await Notification.create({
            recipient: targetUserId,      // The person who requested to join
            sender: panditId,             // The Pandit who clicked approve
            type: "REQUEST_APPROVED",
            community: communityId,
            message: `Your request to join ${community.name} was approved!`
        });

        // Check if they are currently online right now
        const io = req.app.get("io"); // Grab the socket server we attached in index.js
        const targetSocketId = userSocketMap[targetUserId]; // Look up their socket ID

        if (targetSocketId) {
            // If they are online, shoot the notification directly to their screen!
            io.to(targetSocketId).emit("newNotification", newNotification);
        }
        // ==========================================

        // Return the updated arrays so the frontend can refresh instantly
        return res.status(200).json({
            message: "Member approved successfully.",
            pendingMembers: community.pendingMembers,
            members: community.members
        });

    } catch (error) {
        return res.status(500).json({ message: "Error approving member", error: error.message });
    }
};

//?  Pandit rejects a member
export const rejectMember = async (req, res) => {
    try {
        const { communityId, targetUserId } = req.params;
        const panditId = req.userId;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        // Security: Ensure the person making the request is actually a moderator
        if (!community.moderators.includes(panditId)) {
            return res.status(403).json({ message: "Only moderators can reject members." });
        }

        // Just remove the user from the pendingMembers array
        community.pendingMembers = community.pendingMembers.filter(id => id.toString() !== targetUserId.toString());
        await community.save();

        return res.status(200).json({
            message: "Member request rejected.",
            pendingMembers: community.pendingMembers
        });

    } catch (error) {
        return res.status(500).json({ message: "Error rejecting member", error: error.message });
    }
};


//? Edit Community Details (Pandits Only)
export const editCommunity = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // We extract the text fields from the body
        const { name, description, rules } = req.body;

        // 1. Find the community
        const community = await Community.findById(id);
        if (!community) {
            return res.status(404).json({ message: "Community not found." });
        }

        // 2. SECURITY CHECK: Is this user a Pandit?
        if (!community.moderators.includes(userId)) {
            return res.status(403).json({ message: "Access denied. Only moderators can edit this community." });
        }

        // 3. Handle Image Upload ONLY if a new file was actually provided
        if (req.file) {
            const localFilePath = req.file.path;
            const coverImageUrl = await uploadOnCloudinary(localFilePath);

            if (!coverImageUrl) {
                return res.status(500).json({ message: "Failed to upload new cover image." });
            }
            community.coverImage = coverImageUrl; // Update the image url
        }

        // 4. Update the text fields (fallback to existing data if they left the input blank)
        if (name) community.name = name;
        if (description) community.description = description;

        // Note: FormData sends arrays/objects as strings, so we parse it if rules are provided
        if (rules) {
            try {
                // If the frontend sends JSON stringified rules, parse them
                community.rules = JSON.parse(rules);
            } catch (e) {
                // If the frontend just sends a comma-separated string, handle that too
                community.rules = rules.split(',').map(rule => rule.trim());
            }
        }

        // 5. Save the changes to the database
        await community.save();

        return res.status(200).json({
            message: "Community updated successfully!",
            community // Returning the fresh data so the frontend updates instantly
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error updating community",
            error: error.message
        });
    }
};


//? Get all communities the user has joined
export const getMyHubs = async (req, res) => {
    try {
        const userId = req.userId; // From isAuth middleware

        // Find all communities where the user's ID is in the members array
        const myCommunities = await Community.find({ members: userId })
            .sort({ createdAt: -1 }); // Show newest first

        return res.status(200).json({ myCommunities });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching your hubs", error: error.message });
    }
};


//? User voluntarily leaves the community
export const leaveCommunity = async (req, res) => {
    try {
        const communityId = req.params.id;
        const userId = req.userId;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        // Security Check : The Creator cannot leave. They must delete the hub or transfer ownership.
        if (community.creator.toString() === userId.toString()) {
            return res.status(400).json({ message: "The creator cannot leave the community. You must delete the hub instead." });
        }

        // 1. Remove user from the members array
        community.members = community.members.filter(id => id.toString() !== userId.toString());

        // 2. Remove user from the moderators array (just in case they were a Pandit)
        community.moderators = community.moderators.filter(id => id.toString() !== userId.toString());

        await community.save();

        return res.status(200).json({
            message: "You have successfully left the community.",
            community
        });
    } catch (error) {
        return res.status(500).json({ message: "Error leaving community", error: error.message });
    }
};

//? Moderator removes a specific member
export const removeMember = async (req, res) => {
    try {
        const { communityId, targetUserId } = req.params;
        const panditId = req.userId;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        // Security Check : Is the person requesting the removal actually a Moderator?
        if (!community.moderators.includes(panditId)) {
            return res.status(403).json({ message: "Only moderators can remove members." });
        }

        // Security Check : Prevent removing the Creator!
        if (community.creator.toString() === targetUserId.toString()) {
            return res.status(403).json({ message: "You cannot remove the community creator." });
        }

        // 1. Remove from members array
        community.members = community.members.filter(id => id.toString() !== targetUserId.toString());

        // 2. Remove from moderators array (if they were a Pandit being kicked out)
        community.moderators = community.moderators.filter(id => id.toString() !== targetUserId.toString());

        await community.save();

        return res.status(200).json({
            message: "Member removed successfully.",
            members: community.members,
            moderators: community.moderators
        });
    } catch (error) {
        return res.status(500).json({ message: "Error removing member", error: error.message });
    }
};


//? Promote a normal Member to a Moderator (Pandit)
export const promoteMember = async (req, res) => {
    try {
        const { communityId, targetUserId } = req.params;
        const panditId = req.userId;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        // Security Check 1: Is the requester actually a moderator?
        if (!community.moderators.includes(panditId)) {
            return res.status(403).json({ message: "Only moderators can promote members." });
        }

        // Security Check 2: Ensure the target user is actually a member first
        if (!community.members.includes(targetUserId)) {
            return res.status(400).json({ message: "This user is not a member of the community." });
        }

        // Security Check 3: Check if they are ALREADY a moderator
        if (community.moderators.includes(targetUserId)) {
            return res.status(400).json({ message: "This user is already a moderator." });
        }

        // Promote them by pushing their ID into the moderators array
        community.moderators.push(targetUserId);
        await community.save();

        await community.populate("moderators", "name profilePicture") // Populate the moderators to return their details

        return res.status(200).json({
            message: "Member successfully promoted to Moderator.",
            moderators: community.moderators
        });

    } catch (error) {
        return res.status(500).json({ message: "Error promoting member", error: error.message });
    }
};

//? Demote a Moderator back to a normal Member
export const demoteMember = async (req, res) => {
    try {
        const { communityId, targetUserId } = req.params;
        const panditId = req.userId;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: "Community not found" });

        // Security Check 1: Is the requester actually a moderator?
        if (!community.moderators.includes(panditId)) {
            return res.status(403).json({ message: "Only moderators can demote members." });
        }

        // Security Check 2: PROTECT THE CREATOR. No one can demote the owner.
        if (community.creator.toString() === targetUserId.toString()) {
            return res.status(403).json({ message: "You cannot demote the community creator." });
        }

        // Demote them by filtering their ID out of the moderators array
        community.moderators = community.moderators.filter(id => id.toString() !== targetUserId.toString());
        await community.save();

        await community.populate("moderators", "name profilePicture") // Populate the moderators to return their details after the change

        return res.status(200).json({
            message: "Moderator successfully demoted to normal member.",
            moderators: community.moderators
        });

    } catch (error) {
        return res.status(500).json({ message: "Error demoting member", error: error.message });
    }
};