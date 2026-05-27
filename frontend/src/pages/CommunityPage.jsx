import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
import { LuArrowLeft, LuUsers, LuMapPin, LuSettings, LuShieldAlert, LuImage, LuX, LuCalendar, LuMessageSquare, LuUserPlus, LuLogOut } from "react-icons/lu";
import { TfiAnnouncement } from "react-icons/tfi";
import Feed from '../components/Feed';
import EventsTab from '../components/EventsTab';
import Swal from "sweetalert2";


const CommunityPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);

    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [content, setContent] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [posting, setPosting] = useState(false);

    const [activeTab, setActiveTab] = useState("feed"); // "feed" or "events"

    // Media states
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState("");
    const [previewType, setPreviewType] = useState("none");

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [commRes, postRes] = await Promise.all([
                    axios.get(`${serverUrl}/api/community/get-community/${id}`, { withCredentials: true }),
                    axios.get(`${serverUrl}/api/post/get-community-posts/${id}`, { withCredentials: true })
                ]);

                setCommunity(commRes.data.community);
                setPosts(postRes.data.posts);
                setLoading(false);
            } catch (error) {
                console.error("Error loading community:", error);
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMediaFile(file);
            setMediaPreview(URL.createObjectURL(file));

            if (file.type.startsWith("video/")) {
                setPreviewType("video");
            } else if (file.type.startsWith("image/")) {
                setPreviewType("image");
            } else {
                setPreviewType("none");
            }
        }
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview("");
        setPreviewType("none");
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!content.trim() && !mediaFile) return;

        setPosting(true);
        try {
            const formData = new FormData();
            if (content.trim()) formData.append("content", content);
            formData.append("isPinned", isPinned);
            if (mediaFile) formData.append("mediaFile", mediaFile);

            const res = await axios.post(`${serverUrl}/api/post/create-post/${id}`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });

            setPosts([res.data.post, ...posts]);
            setContent("");
            setIsPinned(false);
            clearMedia();
        } catch (error) {
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to post",
                icon: "error"
            });
        } finally {
            setPosting(false);
        }
    };



    const handleJoinCommunity = async () => {
        try {
            await axios.post(`${serverUrl}/api/community/join-community/${id}`, {}, {
                withCredentials: true
            });

            setCommunity(prev => ({
                ...prev,
                pendingMembers: [...(prev.pendingMembers || []), userData._id],
            }));

            alert("Join request sent! Waiting for a Pandit to approve it.");
        } catch (error) {
            console.error("Error joining community:", error);
            alert(error.response?.data?.message || "Could not join community");
        }
    };

    //? Handle leaving the community
    const handleLeaveCommunity = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to leave the community?",
            icon: "warning",
            showCancelButton: true,
            background: "#0f2320",
            color: "#fff",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, leave it!"
        });

        if (!result.isConfirmed) return;

        try {
            await axios.put(`${serverUrl}/api/community/leave-community/${id}`, {}, {
                withCredentials: true
            });

            // Instantly update the UI so they are locked out and see the "Join" button again
            setCommunity(prev => ({
                ...prev,
                members: prev.members.filter(member => member._id !== userData._id),
                moderators: prev.moderators.filter(mod => mod._id !== userData._id)
            }));

            Swal.fire({
                title: "Left!",
                text: "You have left the community.",
                icon: "success",
                background: "#0f2320",
                color: "#fff",
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error leaving community:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to leave community",
                icon: "error"
            });
        }
    };

    if (loading) return (
        <div className="h-screen flex justify-center items-center bg-[#091413]">
            <ClipLoader size={50} color="#4ade80" />
        </div>
    );
    if (!community) return (
        <div className="text-center mt-20 text-xl font-bold text-gray-300 bg-[#091413] min-h-screen">
            Community not found.
        </div>
    );

    const isPandit = community.moderators.some(mod => mod._id === userData?._id);
    const isMember = community.members.some(member => member._id === userData?._id);
    const isPending = community.pendingMembers?.some(user => user._id === userData?._id);

    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 flex flex-col items-center">

            {/* 1. HEADER SECTION */}
            <div
                className={`w-full py-10 px-4 flex justify-center shadow-xl bg-cover bg-center overflow-hidden ${!community.coverImage ? 'bg-[#0f2320] border-b-2 border-gray-700' : ''}`}
                style={community.coverImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8)), url(${community.coverImage})`
                } : {}}
            >
                <div className="w-full max-w-3xl">
                    <button
                        onClick={() => navigate('/')}
                        className={`mb-4 flex items-center transition-colors ${community.coverImage ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        <LuArrowLeft className="mr-2" /> Back to Discover
                    </button>

                    <div className="flex justify-between items-start mb-2">
                        <h1 className="text-3xl font-bold text-white">
                            {community.name}
                        </h1>

                        {/* Leave Community Button (Only for members who aren't the creator) */}
                        {isMember && community.creator !== userData?._id && (
                            <button
                                onClick={handleLeaveCommunity}
                                className="flex items-center bg-red-900/40 hover:bg-red-600 text-red-500 hover:text-white border border-red-800 hover:border-red-600 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm"
                                title="Leave Community"
                            >
                                <LuLogOut className="mr-2" size={18} /> Leave
                            </button>
                        )}

                        {isPandit && (
                            <div className="flex gap-3">

                                {/* Pending Members Button with Notification Badge */}
                                <button
                                    onClick={() => navigate(`/pending-members/${id}`)}
                                    className="relative flex items-center bg-gray-800/90 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                                >
                                    <LuUserPlus className="mr-2" size={18} /> Requests

                                    {/* The Badge: Only shows up if there are actually pending members */}
                                    {community.pendingMembers && community.pendingMembers.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full border-2 border-[#091413]">
                                            {community.pendingMembers.length}
                                        </span>
                                    )}
                                </button>

                                <button
                                    onClick={() => navigate(`/community-edit/${id}`)}
                                    className="flex items-center bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                                >
                                    <LuSettings className="mr-2" size={18} /> Edit Hub
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={`flex flex-wrap gap-4 text-sm mb-4 ${community.coverImage ? 'text-gray-300' : 'text-gray-400'}`}>
                        <span className="flex items-center capitalize"><LuMapPin className="mr-1" /> {community.city}, {community.state}</span>
                        <span className="flex items-center"><LuUsers className="mr-1" /> {community.memberCount} Members</span>
                    </div>

                    <p className={`leading-relaxed ${community.coverImage ? 'text-gray-200' : 'text-gray-300'}`}>
                        {community.description}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-3xl p-4">
                {isMember ? (
                    <>
                        {/* COMMUNITY RULES SECTION */}
                        {community.rules && community.rules.length > 0 && (
                            <div className="bg-[#0f2320] rounded-2xl border-2 border-gray-700 p-4 mb-6 shadow-sm">
                                <h3 className="font-bold text-gray-100 flex items-center mb-3">
                                    <LuShieldAlert className="mr-2 text-blue-400" /> Community Rules
                                </h3>
                                <ul className="space-y-2">
                                    {community.rules.map((rule, index) => (
                                        <li key={index} className="text-sm text-gray-300 flex">
                                            <span className="font-bold text-gray-500 mr-3">{index + 1}.</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* TAB SWITCHER */}
                        <div className="flex bg-[#0f2320] rounded-xl p-1 mb-6 border border-gray-700">
                            <button
                                onClick={() => setActiveTab("feed")}
                                className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg font-bold transition-all duration-200 ${activeTab === "feed"
                                    ? "bg-green-700 text-white shadow-md"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                                    }`}
                            >
                                <LuMessageSquare size={18} /> Discussions
                            </button>
                            <button
                                onClick={() => setActiveTab("events")}
                                className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-lg font-bold transition-all duration-200 ${activeTab === "events"
                                    ? "bg-green-700 text-white shadow-md"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                                    }`}
                            >
                                <LuCalendar size={18} /> Meetups & Events
                            </button>
                        </div>

                        {/* CONDITIONAL RENDERING: Show Feed OR Events based on active tab */}
                        {activeTab === "feed" ? (
                            <>
                                {/* POST COMPOSER  */}
                                <div className="bg-[#0f2320] rounded-2xl border-2 border-gray-700 p-4 mb-8 shadow-sm">
                                    <textarea
                                        className="w-full p-3 bg-[#091413] text-gray-100 placeholder-gray-500 rounded-xl outline-none resize-none min-h-25 border border-gray-700 focus:border-green-600 transition-all"
                                        placeholder={`What's happening in ${community.name}?`}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />

                                    {mediaPreview && (
                                        <div className="relative mt-3 w-fit">
                                            <button
                                                onClick={clearMedia}
                                                className="absolute -top-2 -right-2 bg-gray-900 text-white p-1 rounded-full border border-gray-600 hover:bg-red-600 transition-colors z-10"
                                            >
                                                <LuX size={16} />
                                            </button>
                                            {previewType === "image" && (
                                                <img src={mediaPreview} alt="Preview" className="h-32 rounded-lg object-cover border border-gray-700" />
                                            )}
                                            {previewType === "video" && (
                                                <video src={mediaPreview} className="h-32 rounded-lg object-cover border border-gray-700" controls />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center cursor-pointer text-gray-400 hover:text-green-500 transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                />
                                                <LuImage size={24} />
                                            </label>

                                            {isPandit && (
                                                <label className="flex items-center cursor-pointer text-sm font-medium text-gray-400">
                                                    <input
                                                        type="checkbox"
                                                        className="mr-2 w-4 h-4 accent-green-500"
                                                        checked={isPinned}
                                                        onChange={(e) => setIsPinned(e.target.checked)}
                                                    />
                                                    <TfiAnnouncement className="mr-1" size={16} /> Pin
                                                </label>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleCreatePost}
                                            disabled={posting || (!content.trim() && !mediaFile)}
                                            className="bg-green-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 disabled:bg-gray-700 transition-all"
                                        >
                                            {posting ? "Posting..." : "Post"}
                                        </button>
                                    </div>
                                </div>

                                {/* FEED SECTION */}
                                <div className="space-y-6">
                                    <Feed posts={posts} setPosts={setPosts} community={community} />
                                </div>
                            </>
                        ) : (
                            /* 4. EVENTS SECTION */
                            <EventsTab communityId={id} community={community} />
                        )}
                    </>
                ) : (
                    /* LOCKED STATE UI */
                    <div className="bg-[#0f2320] rounded-2xl border-2 border-gray-700 p-10 text-center shadow-sm mt-4 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <LuUsers size={30} className="text-gray-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">Private Neighborhood</h2>
                        <p className="text-gray-400 mb-6">You must join {community.name} to view announcements, read posts, and participate in the discussion.</p>
                        <button
                            onClick={handleJoinCommunity}
                            disabled={isPending}
                            className={`px-8 py-3 rounded-xl font-bold transition-all ${isPending
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-green-700 text-white hover:bg-green-600'
                                }`}
                        >
                            {isPending ? "Request Pending..." : "Join Community"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;