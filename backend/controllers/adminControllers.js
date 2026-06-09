import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import Community from "../models/communityModel.js";
import Report from "../models/reportModel.js";

// 1. Get Platform Statistics for the Dashboard Overview
export const getDashboardStats = async (req, res) => {
    try {
        // Run all database counts simultaneously for maximum speed
        const [totalUsers, totalPosts, totalCommunities] = await Promise.all([
            User.countDocuments(),
            Post.countDocuments(),
            Community.countDocuments()
        ]);

        return res.status(200).json({
            totalUsers,
            totalPosts,
            totalCommunities
        });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
    }
};

// 2. Get All Users for the Management Table
export const getAllUsers = async (req, res) => {
    try {
        // Fetch all users, sort newest first, and exclude passwords
        const users = await User.find().sort({ createdAt: -1 }).select("-password");

        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// 3. Delete a User (Super Admin Action)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent the admin from accidentally deleting themselves!
        if (id === req.userId.toString()) {
            return res.status(400).json({ message: "You cannot delete your own admin account." });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        //? Note: In a production app, you might also want to delete their posts and comments here,
        // but for now, just removing the user account is perfect.

        return res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};


// 4. Get All Communities for the Admin Table
export const getAllAdminCommunities = async (req, res) => {
    try {
        // Fetch all communities, sort by newest, and populate the moderators so we know who runs it
        const communities = await Community.find()
            .sort({ createdAt: -1 })
            .populate("moderators", "name email profilePicture");

        return res.status(200).json({ communities });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching communities", error: error.message });
    }
};

// 5. Delete a Community (Super Admin Action)
export const deleteAdminCommunity = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCommunity = await Community.findByIdAndDelete(id);

        if (!deletedCommunity) {
            return res.status(404).json({ message: "Community not found." });
        }

        // Cleanup: Also delete all posts that belonged to this community!
        await Post.deleteMany({ community: id });

        return res.status(200).json({ message: "Community and all related posts deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting community", error: error.message });
    }
};


// Fetch all pending reports
export const getReports = async (req, res) => {
    try {
        const reports = await Report.find({ status: "Pending" })
            .sort({ createdAt: -1 })
            .populate("reportedBy", "name profilePicture")
            .populate({
                path: "post",
                populate: { path: "author", select: "name" }
            });

        return res.status(200).json({ reports });
    } catch (error) {
        return res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
};

// Resolve or Dismiss a report
export const handleReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { action } = req.body; // "delete_post" or "dismiss_report"

        const report = await Report.findById(reportId).populate("post");
        if (!report) return res.status(404).json({ message: "Report not found." });

        if (action === "delete_post") {
            if (report.post) {

                await Post.findByIdAndDelete(report.post._id);
            }
            report.status = "Resolved";
        } else if (action === "dismiss_report") {
            report.status = "Dismissed";
        }

        await report.save();
        return res.status(200).json({ message: `Report ${action === 'delete_post' ? 'resolved and post deleted' : 'dismissed'}.` });
    } catch (error) {
        return res.status(500).json({ message: "Error handling report", error: error.message });
    }
};