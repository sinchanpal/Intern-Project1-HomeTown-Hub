import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { LuMapPin, LuCalendar, LuArrowLeft, LuLogOut } from "react-icons/lu";
import { FaUserEdit } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi2";
import emptyDp from "../assets/emptyDP.jpg";
import { setUserData } from '../redux/userSlice';

const Profile = () => {
    const { userId } = useParams(); // Grab the ID from the URL
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);

    const [profileUser, setProfileUser] = useState(null);
    const [userHubs, setUserHubs] = useState([]);
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();

    // Check if the logged-in user is viewing their own profile
    const isOwnProfile = userData && userData._id === userId;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${serverUrl}/api/user/profile/${userId}`, {
                    withCredentials: true
                });

                setProfileUser(res.data.user);
                setUserHubs(res.data.hubs);
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfileData();
        }
    }, [userId]);


    const handleLogout = async () => {
        try {

            await axios.get(`${serverUrl}/api/auth/signout`, {
                withCredentials: true
            });

            dispatch(setUserData(null)); // Clear user data from Redux store     

        } catch (error) {
            console.error("Error logging out:", error);
            alert("Failed to log out. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#091413] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-[#091413] flex flex-col items-center justify-center text-white">
                <h2 className="text-2xl font-bold mb-4">User not found</h2>
                <button onClick={() => navigate(-1)} className="text-blue-400 hover:text-blue-300">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white py-12 px-4 pb-24">
            <div className="max-w-3xl mx-auto">

                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition-colors">
                        <LuArrowLeft className="mr-2" /> Back
                    </button>

                    {isOwnProfile && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/edit-profile')}
                                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-gray-700"
                            >
                                <FaUserEdit size={16} /> Edit Profile
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-xl transition-colors text-sm font-medium border border-red-500/20"
                            >
                                <LuLogOut size={16} /> Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Profile Card */}
                <div className="bg-[#16191f] rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden">
                    {/* Decorative Top Banner */}
                    <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-blue-900/40 to-emerald-900/40"></div>

                    <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 mt-6">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-full border-4 border-[#16191f] shadow-lg overflow-hidden bg-gray-800 shrink-0 flex items-center justify-center text-3xl font-bold">
                            {profileUser.profilePicture ? (
                                <img src={profileUser.profilePicture} alt={profileUser.name} className="w-full h-full object-cover" />
                            ) : (
                                <img src={emptyDp} alt={profileUser.name || 'User'} className="w-full h-full object-cover" />
                            )}
                        </div>

                        {/* Info Details */}
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-extrabold text-white mb-2">{profileUser.name}</h1>

                            {/* Hometown Badge */}
                            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-500/20 mb-4">
                                <LuMapPin size={16} />
                                {profileUser.city}, {profileUser.state}
                            </div>

                            {/* Bio */}
                            {profileUser.bio && (
                                <p className="text-gray-300 text-base leading-relaxed mb-4 max-w-xl">
                                    {profileUser.bio}
                                </p>
                            )}

                            {/* Joined Date */}
                            <div className="flex items-center justify-center sm:justify-start text-gray-500 text-xs font-medium uppercase tracking-wider">
                                <LuCalendar className="mr-1.5" size={14} />
                                Joined {new Date(profileUser.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User's Joined Hubs */}
                <div className="mt-12">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                        <HiOutlineUsers className="text-blue-400" /> {profileUser.name || 'User'}'s Joined Hubs
                    </h3>

                    <div className="space-y-4">
                        {userHubs.length > 0 ? (
                            userHubs.map(hub => (
                                <div key={hub._id} className="bg-[#0f1115] p-5 rounded-2xl border border-emerald-700 hover:border-gray-700 transition-colors cursor-pointer" onClick={() => navigate(`/community-page/${hub._id}`)}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-1 rounded">
                                            {hub.name || "Unknown Hub"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 bg-[#0f1115] rounded-2xl border border-gray-800">
                                <p className="text-gray-500">No hubs joined yet.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;