import User from "../models/userModel.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

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