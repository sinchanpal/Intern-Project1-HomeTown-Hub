import User from "../models/userModel.js";

export const isAdmin = async (req, res, next) => {
    try {
        // req.userId comes from the isAuth middleware that MUST run before this one
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // The Ultimate Check: Are they an admin?
        if (user.role !== "admin") {
            return res.status(403).json({ 
                message: "Access Denied: Super Admin privileges required." 
            });
        }

        next(); // They are an admin! Let them pass to the controller.
    } catch (error) {
        return res.status(500).json({ 
            message: "Server error verifying admin status", 
            error: error.message 
        });
    }
};