import express from 'express';
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import communityRouter from './routes/communityRoutes.js';
import postRouter from './routes/postRoutes.js';
import eventRouter from './routes/eventRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Create an instance of the Express application
const app = express();

// Middlewares 
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from this origin (your frontend)
    credentials: true // Allow cookies to be sent in cross-origin requests
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); //Adding urlencoded allows your server to handle form data, which some testing tools and frontend libraries use by default.
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter); // Use the authRouter for routes starting with /api/auth
app.use("/api/user", userRouter); // Use the userRouter for routes starting with /api/user
app.use("/api/community", communityRouter); // Use the communityRouter for routes starting with /api/community
app.use("/api/post", postRouter); // Use the postRouter for routes starting with /api/post
app.use("/api/event", eventRouter); // Use the eventRouter for routes starting with /api/event

// Start the server and listen on the specified port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    connectDB();
    console.log(`Server is running on port ${PORT}`);
})