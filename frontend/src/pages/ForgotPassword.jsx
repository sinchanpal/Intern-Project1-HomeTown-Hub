import axios from 'axios';
import React, { useState } from 'react'
import { ClipLoader } from "react-spinners";
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { LuEye } from "react-icons/lu";
import { LuEyeClosed } from "react-icons/lu";

const ForgotPassword = () => {

    const [step, setStep] = useState(1);
    const [inputClicked, setInputClicked] = useState({
        Email: false,
        Otp: false,
        NewPassword: false,
        ConfirmPassword: false
    });

    const [showPassword, setShowPassword] = useState(false);

    //state for showing the loading spinner
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [err, setErr] = useState("");

    const navigate = useNavigate();


    // This is for step 1 where we send the otp to the user email
    const handleStep1 = async () => {
        try {

            setLoading(true);
            setErr("");

            const result = await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true });
            console.log(result.data);
            setStep(2);

            setLoading(false);
        } catch (error) {

            setErr(error.response.data.message || "Error sending OTP");
            console.error("Error sending OTP:", error);
            setLoading(false);
        }
    }

    // This is for step 2 where we verify the otp entered by user
    const handleStep2 = async () => {
        try {
            setLoading(true);
            setErr("");

            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true });
            console.log(result.data);
            setStep(3);

            setLoading(false);
        } catch (error) {

            setErr(error.response.data.message || "Error verifying OTP");
            console.error("Error verifying OTP:", error);
            setLoading(false);
        }
    }

    // This is for step 3 where we set the new password after otp verification
    const handleStep3 = async () => {
        try {
            setLoading(true);
            setErr("");

            if (newPassword != confirmPassword) {

                console.log("Password does't match !");
                setErr("Password does't match !");
                setLoading(false);
                return;
            }

            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true });
            console.log(result.data);

            setLoading(false);
            // Handle successful password reset (e.g., redirect to login page)
            navigate('/signin'); // Redirect to the login page after successful password reset
        } catch (error) {

            setErr(error.response.data.message || "Error resetting password");
            console.error("Error reset password:", error);
            setLoading(false);
        }
    }
    return (
        <div className='w-full h-screen bg-linear-to-b from-black to-gray-900 flex flex-col justify-center items-center'>

            {/* This Step 1 here we input gmail id where the otp was send */}
            {step == 1 &&
                <div className='w-[90%] max-w-125 h-125 bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'>
                    <h2 className='text-[27px] font-semibold'>Forgot Password</h2>

                    {/* This is for email field */}
                    <div className='mt-8 relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl  border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, Email: true })}>

                        <label htmlFor='email' className={`text-gray-700 absolute left-5 p-1.25 bg-white text-[16px] ${inputClicked.Email ? "-top-4.5" : ""}`}>Enter your Email</label>
                        <input type="email" id='email' className='w-full h-full rounded-2xl px-5 outline-none border-0' required value={email} onChange={(e) => setEmail(e.target.value)} />

                    </div>

                    {err && <p className='text-red-500 text-[14px]'>{err}</p>}

                    <button className='w-[70%] px-5 py-3 bg-black text-white font-semibold h-12.5 cursor-pointer rounded-2xl mt-7.5' disabled={loading} onClick={handleStep1}>
                        {loading ? <ClipLoader color='white' size={25} /> : "Send OTP"}
                    </button>
                </div>}

            {/* This is Step 2 here we enter and verify the Otp  */}
            {step == 2 &&
                <div className='w-[90%] max-w-125 h-125 bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'>
                    <h2 className='text-[27px] font-semibold'>Forgot Password</h2>

                    {/* This is for OTP field */}
                    <div className='mt-8 relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl  border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, Otp: true })}>

                        <label htmlFor='otp' className={`text-gray-700 absolute left-5 p-1.25 bg-white text-[16px] ${inputClicked.Otp ? "-top-4.5" : ""}`}>Enter the OTP</label>
                        <input type="text" id='otp' className='w-full h-full rounded-2xl px-5 outline-none border-0' required value={otp} onChange={(e) => setOtp(e.target.value)} />

                    </div>

                    {err && <p className='text-red-500 text-[14px]'>{err}</p>}

                    <button className='w-[70%] px-5 py-3 bg-black text-white font-semibold h-12.5 cursor-pointer rounded-2xl mt-7.5' disabled={loading} onClick={handleStep2}>
                        {loading ? <ClipLoader color='white' size={25} /> : "Verify OTP"}
                    </button>
                </div>}


            {/* This is Step 3 here we enter new password and confirm password  */}
            {step == 3 &&
                <div className='w-[90%] max-w-125 h-125 bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23]'>
                    <h2 className='text-[27px] font-semibold'>Reset Password</h2>

                    {/* This is for new password field */}

                    <div className='relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl  border-2 border-black m-3' onClick={() => setInputClicked({ ...inputClicked, NewPassword: true })}>

                        <label htmlFor='new-Password' className={`text-gray-700 absolute left-5 p-1.25 bg-white text-[16px] ${inputClicked.NewPassword ? "-top-4.5" : ""}`}>Enter new Password</label>
                        <input type={showPassword ? "text" : "password"} id='new-Password' className='w-full h-full rounded-2xl px-5 outline-none border-0' required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                        {showPassword ? <LuEyeClosed className='absolute cursor-pointer right-5 w-6.25 h-6.25' onClick={() => setShowPassword(false)} /> : <LuEye className='absolute cursor-pointer right-5 w-6.25 h-6.25' onClick={() => setShowPassword(true)} />}

                    </div>

                    {/* This is for confirm password field */}

                    <div className='relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl  border-2 border-black m-3' onClick={() => setInputClicked({ ...inputClicked, ConfirmPassword: true })}>

                        <label htmlFor='confirm-Password' className={`text-gray-700 absolute left-5 p-1.25 bg-white text-[16px] ${inputClicked.ConfirmPassword ? "-top-4.5" : ""}`}>Enter confirm Password</label>
                        <input type={showPassword ? "text" : "password"} id='confirm-Password' className='w-full h-full rounded-2xl px-5 outline-none border-0' required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                        {showPassword ? <LuEyeClosed className='absolute cursor-pointer right-5 w-6.25 h-6.25' onClick={() => setShowPassword(false)} /> : <LuEye className='absolute cursor-pointer right-5 w-6.25 h-6.25' onClick={() => setShowPassword(true)} />}

                    </div>

                    {err && <p className='text-red-500 text-[14px]'>{err}</p>}

                    <button className='w-[70%] px-5 py-3 bg-black text-white font-semibold h-12.5 cursor-pointer rounded-2xl mt-7.5' disabled={loading} onClick={handleStep3}>
                        {loading ? <ClipLoader color='white' size={25} /> : "Set New Password"}
                    </button>
                </div>}

        </div>
    )
}

export default ForgotPassword
