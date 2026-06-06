import React, { useEffect, useState } from 'react';
import { serverUrl } from '../App';
import axios from 'axios';
import Swal from "sweetalert2";
import { LuTrash2, LuHeart, LuMessageCircle, LuSend, LuShare2 } from "react-icons/lu";
import { TfiAnnouncement } from "react-icons/tfi";
import { useSelector } from 'react-redux';
import emptyDp from "../assets/emptyDP.jpg";
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';


// ADDED setPosts to the incoming props!
const Feed = ({ posts, setPosts, community }) => {

    const { userData } = useSelector(state => state.user);
    const isPandit = community.moderators.some(mod => mod._id === userData?._id);

    const [commentInputs, setCommentInputs] = useState({});
    const [showComments, setShowComments] = useState({});
    const navigate = useNavigate();

    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        const handleNewPost = (incomingPost) => {
            // SECURITY/UX CHECK: Only add the post to the feed IF it belongs to the community currently being viewed!
            const postCommunityId = incomingPost.community._id || incomingPost.community;

            if (postCommunityId.toString() === community._id.toString()) {
                // Add the new post to the VERY TOP of the feed
                setPosts((prevPosts) => [incomingPost, ...prevPosts]);
            }
        };

        // Turn on the listener
        socket.on("newPost", handleNewPost);

        // Cleanup: Turn off the listener when they leave the page so it doesn't duplicate
        return () => {
            socket.off("newPost", handleNewPost);
        };
    }, [socket, community._id, setPosts]);

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

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${serverUrl}/api/post/delete-post/${postId}`, {
                withCredentials: true
            });
            setPosts(posts.filter(post => post._id !== postId));
            Swal.fire({
                title: "Deleted!",
                text: "Your post has been deleted.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error deleting post:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to delete post",
                icon: "error"
            });
        }
    };

    const handleLike = async (postId) => {
        try {
            const res = await axios.put(`${serverUrl}/api/post/like/${postId}`, {}, { withCredentials: true });
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, likes: res.data.likes } : post
            ));
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const toggleComments = (postId) => {
        setShowComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const handleCommentChange = (postId, text) => {
        setCommentInputs(prev => ({ ...prev, [postId]: text }));
    };

    const handleAddComment = async (postId) => {
        const message = commentInputs[postId];
        if (!message || !message.trim()) return;

        try {
            // Updated route to match your new controller setup if needed
            const res = await axios.post(`${serverUrl}/api/post/add-comment/${postId}`, { message }, { withCredentials: true });
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, comments: res.data.comments } : post
            ));
            setCommentInputs(prev => ({ ...prev, [postId]: "" }));
        } catch (error) {
            console.error("Error adding comment:", error);
            alert(error.response?.data?.message || "Failed to add comment");
        }
    };

    //Handle Deleting a Comment
    const handleDeleteComment = async (postId, commentId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this comment?");
        if (!isConfirmed) return;

        try {
            const res = await axios.delete(`${serverUrl}/api/post/delete-comment/${postId}/${commentId}`, {
                withCredentials: true
            });

            // Instantly update UI with the new comments array from the backend response
            setPosts(posts.map(post =>
                post._id === postId ? { ...post, comments: res.data.comments } : post
            ));
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert(error.response?.data?.message || "Failed to delete comment");
        }
    };


    //Handle Share Logic
    const handleShare = () => {
        // Construct the URL to the current community
        const shareUrl = `${window.location.origin}/community-page/${community._id}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            // Show a sleek toast notification
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Link copied to clipboard!',
                showConfirmButton: false,
                timer: 2000,
                background: '#0f2320',
                color: '#fff'
            });
        }).catch(err => {
            console.error("Failed to copy text: ", err);
        });
    };

    return (
        <div>
            {posts.length > 0 ? (
                posts.map(post => {
                    const isAuthor = post.author?._id === userData?._id;
                    const canDelete = isAuthor || isPandit;
                    const hasLiked = post.likes?.includes(userData?._id);

                    return (
                        <div key={post._id} className={`p-5 rounded-2xl border-2 shadow-sm relative mb-6 ${post.isPinned ? 'border-blue-500 bg-gray-900' : 'border-gray-700 bg-[#0f2320]'}`}>

                            <div className="absolute top-4 right-4 flex items-center gap-3">
                                {post.isPinned && (
                                    <div className="flex items-center text-blue-400 text-xs font-bold uppercase tracking-wider">

                                        <TfiAnnouncement className="sm:mr-1" size={16} />
                                        {/* hidden on mobile, inline on small screens and up */}
                                        <span className="hidden sm:inline">Announcement</span>
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
                                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3 flex items-center justify-center font-bold text-gray-300 cursor-pointer" onClick={() => post.author && post.author._id && navigate(`/profile/${post.author._id}`)}>
                                    {post.author && post.author.profilePicture ? (
                                        <img src={post.author.profilePicture} alt={`${post.author.name}'s profile`} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        post.author?.name ? post.author.name[0] : 'U'
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-100 cursor-pointer" onClick={() => post.author && post.author._id && navigate(`/profile/${post.author._id}`)}>{post.author?.name || "Unknown User"}</h4>
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

                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors ml-auto"
                                    title="Copy Community Link"
                                >
                                    <LuShare2 size={20} />
                                    <span className="font-medium hidden sm:inline text-sm">Share</span>
                                </button>
                            </div>

                            {showComments[post._id] && (
                                <div className="mt-4 bg-[#091413] rounded-xl p-4 animate-fade-in-down">
                                    {post.comments && post.comments.length > 0 && (
                                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                            {post.comments.map((comment) => {
                                                // RBAC check for individual comments
                                                const isCommentAuthor = comment.author?._id === userData?._id;
                                                const canDeleteComment = isCommentAuthor || isPandit;

                                                return (
                                                    // Added 'group' class to handle hover effects for the delete button
                                                    <div key={comment._id} className="flex items-start gap-2 group">
                                                        <img
                                                            src={comment.author?.profilePicture || emptyDp}
                                                            alt="avatar"
                                                            className="w-8 h-8 rounded-full object-cover border border-gray-700"
                                                        />
                                                        {/* Added relative positioning to hold the trash icon */}
                                                        <div className="bg-[#0f2320] px-3 py-2 rounded-xl text-sm text-gray-300 w-full relative">
                                                            <span className="font-bold text-white text-xs block mb-1">
                                                                {comment.author?.name || "Unknown User"}
                                                            </span>
                                                            {comment.message}

                                                            {/* Render Trash Icon if they have permission */}
                                                            {canDeleteComment && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(post._id, comment._id)}
                                                                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Delete Comment"
                                                                >
                                                                    <LuTrash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="Write a comment..."
                                            value={commentInputs[post._id] || ""}
                                            onChange={(e) => handleCommentChange(post._id, e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleAddComment(post._id);
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
                    );
                })
            ) : (
                <div className="text-center py-10 text-gray-500">No posts yet. Start the conversation!</div>
            )}
        </div>
    );
}

export default Feed;