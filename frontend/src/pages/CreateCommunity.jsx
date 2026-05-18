import React, { useState } from 'react';
import { ClipLoader } from "react-spinners";
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { LuArrowLeft } from "react-icons/lu";
import { MdGroupAdd } from "react-icons/md";

const CreateCommunity = () => {
    const navigate = useNavigate();

    const [focused, setFocused] = useState({
        name: false,
        state: false,
        city: false,
        description: false
    });

    const [name, setName] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const handleCreateCommunity = async () => {
        if (!name || !state || !city || !description) {
            setErr("Please fill in all fields.");
            return;
        }

        setLoading(true);
        setErr("");

        try {
            const result = await axios.post(`${serverUrl}/api/community/create-community`, {
                name, state, city, description
            }, { withCredentials: true });

            console.log("Community created successfully:", result.data);
            navigate('/');

        } catch (error) {
            setErr(error.response?.data?.message || "An error occurred while creating the community.");
            console.error("Error creating community:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        
        <div className='w-full min-h-screen bg-linear-to-b from-black to-gray-900 flex flex-col justify-center items-center py-10 px-4'>

            
            <div className='w-full max-w-2xl bg-[#0f2320] rounded-2xl flex flex-col border-2 border-gray-700 shadow-2xl p-6 sm:p-10'>

                {/* Header */}
                <div className='flex items-center mb-2'>
                    
                    <button onClick={() => navigate('/')} className='mr-4 p-2 rounded-full hover:bg-gray-700 transition-colors'>
                       
                        <LuArrowLeft size={28} className="text-gray-300" />
                    </button>

                    <div className='flex gap-2.5 items-center font-bold'>
                       
                        <h2 className='text-[20px] sm:text-[30px] font-bold text-white'>Start a Community</h2>
                        <MdGroupAdd className='text-[27px] sm:text-[35px] text-green-500' />
                    </div>
                </div>

               
                <p className='text-gray-400 mb-8 ml-14 sm:ml-16 text-sm sm:text-base'>
                    Create a digital neighborhood for people from your area to connect and share.
                </p>

                {/* Name Field */}
                
                <div className='relative flex items-center w-full h-14 rounded-2xl border-2 border-gray-600 mb-6 focus-within:border-green-600 transition-colors'>
                    <label
                        htmlFor='name'
                       
                        className={`absolute left-4 px-1 bg-[#0f2320] transition-all duration-200 ${(focused.name || name)
                                ? "-top-3 text-xs sm:text-sm font-semibold text-green-400"
                                : "top-3.5 text-gray-500 text-sm sm:text-base pointer-events-none"
                            }`}
                    >
                        Community Name (e.g. Kolkata Tech Hub)
                    </label>
                    <input
                        type="text" id='name'
                       
                        className='w-full h-full rounded-2xl px-5 outline-none border-0 text-sm sm:text-base bg-transparent text-white'
                        required value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocused({ ...focused, name: true })}
                        onBlur={() => setFocused({ ...focused, name: false })}
                    />
                </div>

                {/* State Field */}
                <div className='relative flex items-center w-full h-14 rounded-2xl border-2 border-gray-600 mb-6 focus-within:border-green-600 transition-colors'>
                    <label
                        htmlFor='state'
                        className={`absolute left-4 px-1 bg-[#0f2320] transition-all duration-200 ${(focused.state || state)
                                ? "-top-3 text-xs sm:text-sm font-semibold text-green-400"
                                : "top-3.5 text-gray-500 text-sm sm:text-base pointer-events-none"
                            }`}
                    >
                        State (e.g. West Bengal)
                    </label>
                    <input
                        type="text" id='state'
                        className='w-full h-full rounded-2xl px-5 outline-none border-0 text-sm sm:text-base bg-transparent text-white'
                        required value={state}
                        onChange={(e) => setState(e.target.value)}
                        onFocus={() => setFocused({ ...focused, state: true })}
                        onBlur={() => setFocused({ ...focused, state: false })}
                    />
                </div>

                {/* City Field */}
                <div className='relative flex items-center w-full h-14 rounded-2xl border-2 border-gray-600 mb-6 focus-within:border-green-600 transition-colors'>
                    <label
                        htmlFor='city'
                        className={`absolute left-4 px-1 bg-[#0f2320] transition-all duration-200 ${(focused.city || city)
                                ? "-top-3 text-xs sm:text-sm font-semibold text-green-400"
                                : "top-3.5 text-gray-500 text-sm sm:text-base pointer-events-none"
                            }`}
                    >
                        City/Village (e.g. Kolkata)
                    </label>
                    <input
                        type="text" id='city'
                        className='w-full h-full rounded-2xl px-5 outline-none border-0 text-sm sm:text-base bg-transparent text-white'
                        required value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onFocus={() => setFocused({ ...focused, city: true })}
                        onBlur={() => setFocused({ ...focused, city: false })}
                    />
                </div>

                {/* Description Field */}
                <div className='relative flex w-full min-h-30 rounded-2xl border-2 border-gray-600 mb-6 focus-within:border-green-600 transition-colors'>
                    <label
                        htmlFor='description'
                        className={`absolute left-4 px-1 bg-[#0f2320] transition-all duration-200 ${(focused.description || description)
                                ? "-top-3 text-xs sm:text-sm font-semibold text-green-400"
                                : "top-4 text-gray-500 text-sm sm:text-base pointer-events-none"
                            }`}
                    >
                        What is this community about?
                    </label>
                    <textarea
                        id='description'
                        className='w-full min-h-30 rounded-2xl p-5 pt-4 outline-none border-0 resize-y text-sm sm:text-base bg-transparent text-white'
                        required value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onFocus={() => setFocused({ ...focused, description: true })}
                        onBlur={() => setFocused({ ...focused, description: false })}
                    />
                </div>

                {/* Error Message — red stays readable on dark */}
                {err && <p className='text-red-400 text-[14px] font-medium mb-4 text-center'>{err}</p>}

               
                <div className="flex justify-center w-full">
                    <button
                        className='w-full sm:w-[85%] px-5 py-3 bg-green-700 text-white hover:bg-green-600 transition-colors font-semibold h-14 cursor-pointer rounded-2xl mt-2 flex justify-center items-center disabled:bg-gray-600'
                        disabled={loading}
                        onClick={handleCreateCommunity}
                    >
                        {loading ? <ClipLoader color='white' size={25} /> : "Create Community"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default CreateCommunity;