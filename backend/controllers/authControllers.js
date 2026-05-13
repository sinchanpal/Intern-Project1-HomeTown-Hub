import genToken from "../config/token.js";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import sendMail from "../config/mail.js";

//? Sign Up Controller
export const SignUp = async (req, res) => {
    try {

        const { name, email, password, city, state } = req.body;

        if (!name || !email || !password || !city || !state) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user with the same email or username already exists
        const existingUser = await User.findOne({ email });

        // If user exists, return an error response
        if (existingUser) {
            return res.status(400).json({ message: "User with the same email  already exists!" });
        }

        //user must be entered a password with at least 6 characters
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            state,
            city

        });

        //now we will create a token for the user and store it in a cookie so that the user can be authenticated in future requests without having to log in again
        const token = await genToken(user._id);

        // Set the token in a cookie
        res.cookie("token", token, {
            httpOnly: true, // This makes the cookie inaccessible to JavaScript on the client side, enhancing security
            maxAge: 365 * 24 * 60 * 60 * 1000, // Cookie expires in 1 year
            secure: false, //for development, set to true in production when using HTTPS
            sameSite: "Strict", // changed from Strict to Lax


        });

        // Return the user data (excluding password) in the response
        const userResponse = await User.findById(user._id).select("-password");

        return res.status(200).json(userResponse);


    } catch (error) {
        return res.status(500).json({ message: "Error signing up user", error: error.message });
    }
}


//Signin controller
export const Signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user with the provided email exists
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found with the provided email" });
        }

        //compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        //now we will create a token for the user and store it in a cookie so that the user can be authenticated in future requests without having to log in again
        const token = await genToken(user._id);

        // Set the token in a cookie
        res.cookie("token", token, {
            httpOnly: true, // This makes the cookie inaccessible to JavaScript on the client side, enhancing security
            maxAge: 365 * 24 * 60 * 60 * 1000, // Cookie expires in 1 year
            secure: false, //for development, set to true in production when using HTTPS
            sameSite: "Strict", // changed from Strict to Lax


        });

        // Return the user data (excluding password) in the response
        const userResponse = await User.findById(user._id).select("-password");

        return res.status(200).json(userResponse);

    } catch (error) {
        return res.status(500).json({ message: "Error signing in user", error: error.message });
    }
}



//Signout controller
export const Signout = async (req, res) => {
    try {

        // Clear the token cookie to sign out the user
        res.clearCookie("token", {
            httpOnly: true, // This makes the cookie inaccessible to JavaScript on the client side, enhancing security
            secure: false, //for development, set to true in production when using HTTPS
            sameSite: "Strict" // This helps prevent CSRF attacks by ensuring the cookie is only sent in requests originating from the same site
        });

        return res.status(200).json({ message: "User signed out successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Error signing out user", error: error.message });
    }
}



export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "User not found with the provided email" });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetOTP = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // OTP expires in 5 minutes
        user.isOTPVerified = false; // Reset OTP verification status

        await user.save();

        // Send the OTP to the user's email
        await sendMail(email, otp);

        return res.status(200).json({ message: "OTP sent to email successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error sending OTP", error: error.message });
    }
}


export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.resetOTP || user.resetOTP !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isOTPVerified = true; // Mark OTP as verified
        user.resetOTP = undefined; // Clear the OTP
        user.otpExpires = undefined; // Clear the OTP expiration time

        await user.save();

        return res.status(200).json({ message: "OTP verified successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
}


export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user || !user.isOTPVerified) {
            return res.status(400).json({ message: "Invalid request. Please verify OTP first." });
        }

        // Hash the new password before saving to the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.isOTPVerified = false; // Reset OTP verification status after password reset

        await user.save();

        return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error resetting password", error: error.message });
    }
}