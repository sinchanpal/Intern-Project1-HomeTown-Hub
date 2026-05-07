import jwt from "jsonwebtoken"

export const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        // Verify the token and extract the user ID.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId; // Attach the user ID to the request object for use in subsequent middleware or route handlers

        next(); // Call the next route handler
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
    }
}