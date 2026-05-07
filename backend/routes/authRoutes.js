import express from "express"
import { resetPassword, sendOTP, Signin, Signout, SignUp, verifyOTP } from "../controllers/authControllers.js";


const authRouter = express.Router();

authRouter.post("/signup", SignUp);
authRouter.post("/signin", Signin);
authRouter.get("/signout", Signout);
authRouter.post("/send-otp", sendOTP);
authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/reset-password", resetPassword);


export default authRouter;