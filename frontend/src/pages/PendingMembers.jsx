import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import { LuArrowLeft, LuCheck, LuX, LuUserX } from "react-icons/lu";
import { ClipLoader } from "react-spinners";
import emptyDp from "../assets/emptyDP.jpg";

const PendingMembers = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);

    const [loading, setLoading] = useState(true);
    const [communityName, setCommunityName] = useState("");
    const [pendingMembers, setPendingMembers] = useState([]);

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/community/get-community/${id}`, { withCredentials: true });
                const comm = res.data.community;

                // Frontend Security: Kick them out if they aren't a moderator
                const isPandit = comm.moderators.some(mod => mod._id === userData?._id);
                if (!isPandit) {
                    alert("Unauthorized! Only Pandits can manage requests.");
                    navigate(`/community-page/${id}`);
                    return;
                }

                setCommunityName(comm.name);
                setPendingMembers(comm.pendingMembers || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching community", error);
                navigate("/");
            }
        };
        if (userData) fetchCommunity();
    }, [id, userData, navigate]);

    const handleApprove = async (targetUserId) => {
        try {
            await axios.put(`${serverUrl}/api/community/approve-member/${id}/${targetUserId}`, {}, {
                withCredentials: true
            });
            // Instantly remove them from the UI list
            setPendingMembers(prev => prev.filter(user => user._id !== targetUserId));
        } catch (error) {
            console.error("Error approving member:", error);
            alert(error.response?.data?.message || "Failed to approve member");
        }
    };

    const handleReject = async (targetUserId) => {
        try {
            await axios.put(`${serverUrl}/api/community/reject-member/${id}/${targetUserId}`, {}, {
                withCredentials: true
            });
            // Instantly remove them from the UI list
            setPendingMembers(prev => prev.filter(user => user._id !== targetUserId));
        } catch (error) {
            console.error("Error rejecting member:", error);
            alert(error.response?.data?.message || "Failed to reject member");
        }
    };

    if (loading) return <div className="h-screen flex justify-center items-center bg-[#091413]"><ClipLoader color="#4ade80" size={50} /></div>;

    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white flex justify-center py-12 px-4">
            <div className="w-full max-w-2xl bg-[#0f2320] rounded-2xl p-8 border border-gray-700 shadow-xl">

                <button onClick={() => navigate(`/community-page/${id}`)} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium">
                    <LuArrowLeft className="mr-2" /> Back to {communityName}
                </button>

                <div className="flex items-center justify-between mb-8 border-b border-gray-700/50 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Join Requests</h1>
                        <p className="text-gray-400 text-sm">Review users who want to join your neighborhood.</p>
                    </div>
                    <span className="bg-green-900/40 text-green-400 font-bold py-2 px-4 rounded-xl border border-green-800">
                        {pendingMembers.length} Pending
                    </span>
                </div>

                {pendingMembers.length === 0 ? (
                    <div className="text-center py-16 bg-[#091413] rounded-2xl border-2 border-dashed border-gray-700">
                        <LuUserX size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">You're all caught up!</h3>
                        <p className="text-gray-500">There are no pending join requests at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingMembers.map(user => (
                            <div key={user._id} className="flex justify-between items-center bg-[#091413] border border-gray-700 p-4 rounded-xl hover:border-gray-500 transition-colors">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={user.profilePicture || emptyDp}
                                        alt={`${user.name}'s avatar`}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                                    />
                                    <div>
                                        <span className="text-gray-100 font-bold block text-lg">{user.name}</span>
                                        <span className="text-sm text-gray-400">Requested to join</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleReject(user._id)}
                                        className="flex items-center justify-center p-3 bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-900/50 hover:border-red-600"
                                        title="Reject"
                                    >
                                        <LuX size={22} />
                                    </button>
                                    <button
                                        onClick={() => handleApprove(user._id)}
                                        className="flex items-center justify-center p-3 bg-green-900/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all border border-green-900/50 hover:border-green-600"
                                        title="Approve"
                                    >
                                        <LuCheck size={22} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingMembers;