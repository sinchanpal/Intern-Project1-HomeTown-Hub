import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector, useDispatch } from 'react-redux';
import { LuCamera, LuArrowLeft, LuMail, LuMapPin } from "react-icons/lu";
import { setUserData } from '../redux/userSlice';

const EditProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { userData } = useSelector(state => state.user);

    const [updating, setUpdating] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");

    // Image States
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState("");

    // Populate the form with existing user data when it loads
    useEffect(() => {
        if (userData) {
            setName(userData.name || "");
            setBio(userData.bio || "");
            setPreview(userData.profilePicture || "");
        } else {
            // If they somehow get here without being logged in, send them away
            navigate('/signin');
        }
    }, [userData, navigate]);

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreview(URL.createObjectURL(file)); // Create a local preview URL
        }
    };

    // Submit the Form
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("bio", bio);

        if (profilePicture) {
            formData.append("profilePicture", profilePicture);
        }

        try {
            const res = await axios.put(`${serverUrl}/api/user/edit-profile`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });

           
            dispatch(setUserData(res.data.user));

            // Redirect back to Home 
            navigate(`/`);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert(error.response?.data?.message || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    if (!userData) return null; // Prevent flicker while redirecting

    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white flex justify-center py-12 px-4">
            <div className="w-full max-w-xl bg-[#16191f] rounded-2xl p-8 border border-gray-800 shadow-xl">

                <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <LuArrowLeft className="mr-2" /> Back
                </button>

                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                    Edit Your Profile
                </h1>

                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Avatar Upload Section - Made circular for profiles! */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative w-32 h-32 bg-[#0f1115] border-2 border-dashed border-gray-700 rounded-full overflow-hidden flex flex-col justify-center items-center group hover:border-gray-500 transition-colors cursor-pointer">
                            {preview ? (
                                <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover opacity-70 group-hover:opacity-40 transition-opacity" />
                            ) : (
                                <LuCamera size={30} className="text-gray-600 mb-1" />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                <span className="text-xs font-bold text-white">Change</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* Read-Only Information */}
                    <div className="bg-[#0f1115] p-4 rounded-xl border border-gray-800 mb-6 flex justify-between items-center">
                        <div className="flex items-center text-gray-400 text-sm">
                            <LuMail className="mr-2" /> {userData.email}
                        </div>
                        <div className="flex items-center text-gray-400 text-[12px] capitalize">
                            <LuMapPin className="mr-2" /> {userData.city}, {userData.state}
                        </div>
                    </div>

                    {/* Editable Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">About You (Bio)</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Full-stack developer who loves Sunday football..."
                            className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors min-h-25 resize-none"
                            maxLength={160}
                        />
                        <div className="text-right text-xs text-gray-500 mt-1">{bio.length}/160</div>
                    </div>

                    <button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:bg-gray-600 mt-8"
                    >
                        {updating ? "Saving Profile..." : "Save Changes"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default EditProfile;