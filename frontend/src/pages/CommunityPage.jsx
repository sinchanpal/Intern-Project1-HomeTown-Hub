import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
import { LuArrowLeft, LuUsers, LuMapPin, LuMegaphone, LuSettings, LuShieldAlert } from "react-icons/lu";

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

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setPosting(true);
        try {
            const res = await axios.post(`${serverUrl}/api/post/create-post/${id}`, {
                content,
                isPinned: isPinned
            }, { withCredentials: true });

            setPosts([res.data.post, ...posts]);
            setContent("");
            setIsPinned(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to post");
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
                members: [...prev.members, userData._id],
                memberCount: prev.memberCount + 1
            }));
        } catch (error) {
            console.error("Error joining community:", error);
            alert(error.response?.data?.message || "Could not join community");
        }
    };

    if (loading) return <div className="h-screen flex justify-center items-center"><ClipLoader size={50} /></div>;
    if (!community) return <div className="text-center mt-20 text-xl font-bold">Community not found.</div>;

    const isPandit = community.moderators.some(mod => mod._id === userData?._id);
    const isMember = community.members.includes(userData?._id);

    return (
        <div className="min-h-screen bg-[#fbf8f2] flex flex-col items-center">

            {/* 1. HEADER SECTION (Now with dynamic background & text colors!) */}
            <div
                className={`w-full py-10 px-4 flex justify-center shadow-xl bg-cover bg-center ${!community.coverImage ? 'bg-white border-b-2 border-gray-200' : ''}`}
                style={community.coverImage ? {
                    // This applies a 70% dark overlay on top of your image
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.8)), url(${community.coverImage})`
                } : {}}
            >
                <div className="w-full max-w-3xl">
                    <button
                        onClick={() => navigate('/')}
                        className={`mb-4 flex items-center transition-colors ${community.coverImage ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}
                    >
                        <LuArrowLeft className="mr-2" /> Back to Discover
                    </button>

                    <div className="flex justify-between items-start mb-2">
                        <h1 className={`text-3xl font-bold ${community.coverImage ? 'text-white' : 'text-gray-900'}`}>
                            {community.name}
                        </h1>

                        {isPandit && (
                            <button
                                onClick={() => navigate(`/community-edit/${id}`)}
                                className="flex items-center bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                            >
                                <LuSettings className="mr-2" /> Edit Hub
                            </button>
                        )}
                    </div>

                    <div className={`flex flex-wrap gap-4 text-sm mb-4 ${community.coverImage ? 'text-gray-300' : 'text-gray-500'}`}>
                        <span className="flex items-center capitalize"><LuMapPin className="mr-1" /> {community.city}, {community.state}</span>
                        <span className="flex items-center"><LuUsers className="mr-1" /> {community.memberCount} Members</span>
                    </div>
                    <p className={`leading-relaxed ${community.coverImage ? 'text-gray-200' : 'text-gray-700'}`}>
                        {community.description}
                    </p>
                </div>
            </div>

            <div className="w-full max-w-3xl p-4">
                {isMember ? (
                    <>
                        {/* NEW: COMMUNITY RULES SECTION */}
                        {community.rules && community.rules.length > 0 && (
                            <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 mb-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 flex items-center mb-3">
                                    <LuShieldAlert className="mr-2 text-blue-500" /> Community Rules
                                </h3>
                                <ul className="space-y-2">
                                    {community.rules.map((rule, index) => (
                                        <li key={index} className="text-sm text-gray-700 flex">
                                            <span className="font-bold text-gray-400 mr-3">{index + 1}.</span>
                                            {rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 2. POST COMPOSER */}
                        <div className="bg-white rounded-2xl border-2 border-[#1a1f23] p-4 mb-8 shadow-sm">
                            <textarea
                                className="w-full p-3 bg-gray-50 rounded-xl outline-none resize-none min-h-25 border border-gray-200 focus:border-black transition-all"
                                placeholder={`What's happening in ${community.name}?`}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <div className="flex justify-between items-center mt-4">
                                {isPandit ? (
                                    <label className="flex items-center cursor-pointer text-sm font-medium text-gray-600">
                                        <input
                                            type="checkbox"
                                            className="mr-2 w-4 h-4 accent-black"
                                            checked={isPinned}
                                            onChange={(e) => setIsPinned(e.target.checked)}
                                        />
                                        <LuMegaphone className="mr-1" size={16} /> Pin as Announcement
                                    </label>
                                ) : <div></div>}

                                <button
                                    onClick={handleCreatePost}
                                    disabled={posting || !content.trim()}
                                    className="bg-black text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-all"
                                >
                                    {posting ? "Posting..." : "Post"}
                                </button>
                            </div>
                        </div>

                        {/* 3. FEED SECTION */}
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <div key={post._id} className={`p-5 rounded-2xl border-2 ${post.isPinned ? 'border-blue-500 bg-blue-50' : 'border-[#1a1f23] bg-white'} shadow-sm relative`}>
                                        {post.isPinned && (
                                            <div className="absolute top-4 right-4 flex items-center text-blue-600 text-xs font-bold uppercase tracking-wider">
                                                <LuMegaphone className="mr-1" size={14} /> Announcement
                                            </div>
                                        )}
                                        <div className="flex items-center mb-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 flex items-center justify-center font-bold text-gray-600">
                                                {post.author.name[0]}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{post.author.name}</h4>
                                                <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400">No posts yet. Start the conversation!</div>
                            )}
                        </div>
                    </>
                ) : (
                    /* THE LOCKED STATE UI */
                    <div className="bg-white rounded-2xl border-2 border-[#1a1f23] p-10 text-center shadow-sm mt-4 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <LuUsers size={30} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Private Neighborhood</h2>
                        <p className="text-gray-600 mb-6">You must join {community.name} to view announcements, read posts, and participate in the discussion.</p>
                        <button
                            onClick={handleJoinCommunity}
                            className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all"
                        >
                            Join Community
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunityPage;