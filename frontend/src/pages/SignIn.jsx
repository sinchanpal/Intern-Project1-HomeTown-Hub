
import React, { useState } from 'react'
import homeTownBlackLogo from '../assets/hometownhub-blackBG-image.png'
import homeTownWhiteLogo from '../assets/hometownhub-whiteBG-image.png'
import { LuEye } from "react-icons/lu";
import { LuEyeClosed } from "react-icons/lu";
import { ClipLoader } from "react-spinners";
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';


const SignIn = () => {

    //for navigation
    const navigate = useNavigate();

    const [inputClicked, setInputClicked] = useState({
        email: false,
        password: false,
    })

    const [showPassword, setShowPassword] = useState(false);

    //states for all input field
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //state for showing the loading spinner
    const [loading, setLoading] = useState(false);

    const [err, setErr] = useState("");

    const dispatch = useDispatch();

    const handleSignIn = async () => {

        // 1. Frontend Validation
        if (!email || !password) {
            setErr("Please enter both email and password.");
            return;
        }

        setLoading(true);
        setErr("");

        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email,
                password
            }, { withCredentials: true });

            dispatch(setUserData(result.data)); // Set the user data in the Redux store
            console.log("Sign in successful:", result.data);


        } catch (error) {

            setErr(error.response.data.message || "Error signing in");
            console.error("Error signing in:", error);
        } finally {
            setLoading(false);
        }
    }



    return (
        <div className='w-full h-screen bg-linear-to-b from-black to-gray-900 flex flex-col justify-center items-center'>
            <div className='w-[90%] lg:max-w-[60%] h-170 bg-white rounded-2xl flex justify-center items-center overflow-hidden border-2 border-[#1a1f23]'>

                {/* To show the form */}
                <div className='w-full lg:w-[50%] h-full bg-white flex flex-col justify-center items-center p-2.5 gap-6'>

                    <div className='flex gap-2.5 items-center text-[20px] font-semibold mt-10'>
                        <span>Sign In to</span>
                        <img src={homeTownWhiteLogo} alt="home town hub logo" className='w-17.5' />
                    </div>


                    {/* This is for email field */}
                    <div className='relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl  border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, email: true })}>

                        <label htmlFor='email' className={`text-gray-700 absolute left-5 p-1.25 bg-white text-[16px] ${inputClicked.email ? "-top-4.5" : ""}`}>Enter your Email</label>
                        <input type="email" id='email' className='w-full h-full rounded-2xl px-5 outline-none border-0' required value={email} onChange={(e) => setEmail(e.target.value)} />

                    </div>

                    {/* This is for password field */}
                    <div className='relative flex items-center justify-start w-[90%] h-12.5 rounded-2xl  border-2 border-black' onClick={() => setInputClicked({ ...inputClicked, password: true })}>

                        <label htmlFor='password' className={`text-gray-700 absolute left-5 p-1.25 bg-white text-[16px] ${inputClicked.password ? "-top-4.5" : ""}`}>Enter a strong Password</label>
                        <input type={showPassword ? "text" : "password"} id='password' className='w-full h-full rounded-2xl px-5 outline-none border-0' required value={password} onChange={(e) => setPassword(e.target.value)} />

                        {showPassword ? <LuEyeClosed className='absolute cursor-pointer right-5 w-6.25 h-6.25' onClick={() => setShowPassword(false)} /> : <LuEye className='absolute cursor-pointer right-5 w-6.25 h-6.25' onClick={() => setShowPassword(true)} />}

                    </div>

                    <div className='w-[90%] px-5 cursor-pointer' onClick={() => navigate('/forgot-password')}>Forgot Password</div>

                    {err && <p className='text-red-500 text-[14px]'>{err}</p>}

                    <button className='w-[70%] px-5 py-3 bg-black text-white font-semibold h-12.5 cursor-pointer rounded-2xl mt-7.5' onClick={handleSignIn} disabled={loading}>
                        {loading ? <ClipLoader color='white' size={25} /> : "Sign In"}
                    </button>

                    <p className='text-gray-800 cursor-pointer' onClick={() => navigate('/signup')}>
                        Don't Have an Account ? <span className='border-b-2 border-b-black pb-0.75 text-black font-semibold'>Sign Up</span>
                    </p>
                </div>

                {/* To show the Logo. In small screen we dont't show this logo div */}
                <div className='md:w-[50%] h-full hidden lg:flex justify-center items-center bg-[#000000] flex-col gap-2.5 text-white text-[16px] font-semibold rounded-l-[30px] shadow-2xl shadow-black' >
                    <img src={homeTownBlackLogo} alt="home town hub Logo" className='w-[60%] hover:scale-110 transition-all' />
                    <p>Not Just A Platform , It's A Big Family</p>
                </div>
            </div>
        </div>
    )
}

export default SignIn
