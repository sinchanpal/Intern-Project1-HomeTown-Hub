import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
import { LuArrowLeft, LuUsers, LuMapPin, LuMegaphone, LuSettings, LuShieldAlert, LuImage, LuX, LuTrash2, LuHeart, LuMessageCircle, LuSend } from "react-icons/lu";
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

    //State to track comment input for each individual post
    const [commentInputs, setCommentInputs] = useState({});
    //State to track which comment sections are open
    const [showComments, setShowComments] = useState({});

    //Function to toggle a specific post's comment section
    const toggleComments = (postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId] // Flips true to false, or undefined to true
        }));
    };

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
            alert(error.response?.data?.message || "Failed to post");
        } finally {
            setPosting(false);
        }
    };



    const handleDeletePost = async (postId) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this post!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        });

        // If user cancels, stop execution
        if (!result.isConfirmed) return;

        try {
            await axios.delete(
                `${serverUrl}/api/post/delete-post/${postId}`,
                {
                    withCredentials: true
                }
            );

            // Remove deleted post from UI
            setPosts(posts.filter(post => post._id !== postId));

            // Success Alert
            Swal.fire({
                title: "Deleted!",
                text: "Your post has been deleted.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

        } catch (error) {
            console.error("Error deleting post:", error);

            // Error Alert
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to delete post",
                icon: "error"
            });
        }
    };

    // Handle Liking a Post
    const handleLike = async (postId) => {
        try {
            const res = await axios.put(`${serverUrl}/api/post/like/${postId}`, {}, { withCredentials: true });

            // Instantly update the UI by replacing the likes array for this specific post
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: res.data.likes } : post
            ));
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    // Handle Comment Input Change
    const handleCommentChange = (postId, text) => {
        setCommentInputs(prev => ({ ...prev, [postId]: text }));
    };

    // Handle Submitting a Comment
    const handleAddComment = async (postId) => {
        const message = commentInputs[postId];
        if (!message || !message.trim()) return;

        try {
            const res = await axios.post(`${serverUrl}/api/post/comment/${postId}`, { message }, { withCredentials: true });

            // Instantly update the UI with the new comments array
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, comments: res.data.comments } : post
            ));

            // Clear the input box for this post
            setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        } catch (error) {
            console.error("Error adding comment:", error);
            alert(error.response?.data?.message || "Failed to add comment");
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
    const isMember = community.members.includes(userData?._id);

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

                        {isPandit && (
                            <button
                                onClick={() => navigate(`/community-edit/${id}`)}
                                className="flex items-center bg-white/90 hover:bg-white text-gray-900 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                            >
                                <LuSettings className="mr-2" /> Edit Hub
                            </button>
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

                        {/* 2. POST COMPOSER */}
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
                                            <LuMegaphone className="mr-1" size={16} /> Pin
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

                        {/* 3. FEED SECTION */}
                        <div className="space-y-6">
                            {posts.length > 0 ? (
                                posts.map(post => {
                                    const isAuthor = post.author?._id === userData?._id;
                                    const canDelete = isAuthor || isPandit;
                                    //Check if the current user has liked this post
                                    const hasLiked = post.likes?.includes(userData?._id);

                                    return (
                                        <div key={post._id} className={`p-5 rounded-2xl border-2 shadow-sm relative ${post.isPinned ? 'border-blue-500 bg-gray-900' : 'border-gray-700 bg-[#0f2320]'}`}>

                                            <div className="absolute top-4 right-4 flex items-center gap-3">
                                                {post.isPinned && (
                                                    <div className="flex items-center text-blue-400 text-xs font-bold uppercase tracking-wider">
                                                        <LuMegaphone className="mr-1" size={14} /> Announcement
                                                    </div>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => handleDeletePost(post._id)}
                                                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                        title="Delete Post"
                                                    >
                                                        <LuTrash2 size={18} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center mb-3 pr-20">
                                                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3 flex items-center justify-center font-bold text-gray-300">
                                                    {post.author && post.author.profilePicture ? (
                                                        <img src={post.author.profilePicture} alt={`${post.author.name}'s profile`} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        post.author?.name ? post.author.name[0] : 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-100">{post.author?.name || "Unknown User"}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {post.content && (
                                                <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
                                            )}

                                            {post.media && post.mediaType === "image" && (
                                                <div className="mt-4 rounded-xl overflow-hidden border border-gray-700">
                                                    <img src={post.media} alt="Post media" className="w-full max-h-125 object-cover" />
                                                </div>
                                            )}
                                            {post.media && post.mediaType === "video" && (
                                                <div className="mt-4 rounded-xl overflow-hidden border border-gray-700 bg-black">
                                                    <video src={post.media} controls className="w-full max-h-125" />
                                                </div>
                                            )}

                                            {/* Action Bar (Likes & Comments Count) */}
                                            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700/50">
                                                <button
                                                    onClick={() => handleLike(post._id)}
                                                    className={`flex items-center gap-2 transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                                                >
                                                    <LuHeart className={hasLiked ? "fill-current" : ""} size={20} />
                                                    <span className="font-medium">{post.likes?.length || 0}</span>
                                                </button>
                                                <button
                                                    onClick={() => toggleComments(post._id)}
                                                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <LuMessageCircle size={20} />
                                                    <span className="font-medium">{post.comments?.length || 0}</span>
                                                </button>
                                            </div>

                                            {/*Comment Section (Only visible if toggled ON) */}
                                            {showComments[post._id] && (
                                                <div className="mt-4 bg-[#091413] rounded-xl p-4 animate-fade-in-down">
                                                    {/* Render existing comments */}
                                                    {post.comments && post.comments.length > 0 && (
                                                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                                            {post.comments.map((comment, i) => (
                                                                <div key={i} className="flex items-start gap-2">
                                                                    <img
                                                                        src={comment.author?.profilePicture || "https://via.placeholder.com/150"}
                                                                        alt="avatar"
                                                                        className="w-8 h-8 rounded-full object-cover border border-gray-700"
                                                                    />
                                                                    <div className="bg-[#0f2320] px-3 py-2 rounded-xl text-sm text-gray-300 w-full">
                                                                        <span className="font-bold text-white text-xs block mb-1">
                                                                            {comment.author?.name || "Unknown User"}
                                                                        </span>
                                                                        {comment.message}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Input field to add a new comment */}
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Write a comment..."
                                                            value={commentInputs[post._id] || ""}
                                                            onChange={(e) => handleCommentChange(post._id, e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleAddComment(post._id);
                                                                    // Optional: Force the comments open if they comment while it's closed
                                                                    setShowComments(prev => ({ ...prev, [post._id]: true }));
                                                                }
                                                            }}
                                                            className="flex-1 bg-[#0f2320] text-sm text-white px-4 py-2.5 rounded-full outline-none border border-gray-700 focus:border-green-600 transition-colors"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                handleAddComment(post._id);
                                                                setShowComments(prev => ({ ...prev, [post._id]: true }));
                                                            }}
                                                            disabled={!commentInputs[post._id]?.trim()}
                                                            className="text-white bg-green-700 p-2 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-full transition-colors flex items-center justify-center"
                                                        >
                                                            <LuSend size={18} className="ml-0.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-10 text-gray-500">No posts yet. Start the conversation!</div>
                            )}
                        </div>
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
                            className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition-all"
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