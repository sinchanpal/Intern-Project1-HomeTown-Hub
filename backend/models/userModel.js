import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        state: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        city: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        role: {
            type: String,
            enum: ["user", "moderator", "admin"],
            default: "user", // Everyone starts as a standard user
        },
        profilePicture: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
            maxLength: 160 // Keep it short and sweet like Twitter/Instagram
        },
        resetOTP: {
            type: String
        },
        otpExpires: {
            type: Date
        },
        isOTPVerified: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
    }
);

const User = mongoose.model("User", userSchema);

export default User;