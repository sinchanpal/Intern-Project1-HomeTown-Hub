import User from "../models/userModel.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Community from "../models/communityModel.js";
import Post from "../models/postModel.js";

// This controller is used to get the current user details.
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: No user ID found in request" });
        }

        // Fetch the user from the database using the user ID extracted from the token . Exclude the password field from the response for security reasons
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error in getCurrentUser", error: error.message });
    }
}


// Fetch a specific user's public profile and their posts
export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find the user but EXCLUDE private data (-password and -email)
        const user = await User.findById(userId).select("-password -email");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        //fetch all the community where the user is a member or moderator
        const userHubs = await Community.find({ $or: [{ members: userId }, { moderators: userId }] }).select("name");


        return res.status(200).json({
            user,
            hubs: userHubs
        });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return res.status(500).json({ message: "Error fetching user profile", error: error.message });
    }
};


// This controller allows a user to update their profile information, including their profile picture and bio.
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId; // Securely grabbed from your isAuth middleware
        const { name, bio } = req.body;

        // 1. Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Handle Profile Picture Upload (if a new file was provided)
        if (req.file) {
            const localFilePath = req.file.path;
            const avatarUrl = await uploadOnCloudinary(localFilePath);

            if (!avatarUrl) {
                return res.status(500).json({ message: "Failed to upload profile picture." });
            }
            user.profilePicture = avatarUrl;
        }

        // 3. Update Text Fields (only if they were provided in the request)
        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio; // Allows them to clear the bio by sending an empty string

        // 4. Save to database
        await user.save();

        // 5. Before sending the user back to the frontend, remove the password for security!
        user.password = undefined;

        return res.status(200).json({
            message: "Profile updated successfully!",
            user
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error updating profile",
            error: error.message
        });
    }
};


// Fetch all notifications for the logged-in user
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 }) // Newest first
            .populate({ path: "sender", select: "name profilePicture" }) // Safer object syntax
            .populate({ path: "community", select: "name" });
        return res.status(200).json({ notifications });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching notifications", error: error.message });
    }
};

// Mark all unread notifications as read
export const markNotificationsAsRead = async (req, res) => {
    try {

        await Notification.updateMany(
            { recipient: req.userId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ message: "Error updating notifications", error: error.message });
    }
};



//Delete/Dismiss an individual notification
export const deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.userId;

        // Find the notification and delete it ONLY if it belongs to the requesting user
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found or unauthorized to delete." });
        }

        return res.status(200).json({ message: "Notification dismissed successfully." });
    } catch (error) {
        return res.status(500).json({ message: "Error dismissing notification", error: error.message });
    }
};


