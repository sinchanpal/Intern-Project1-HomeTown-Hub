import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import { LuArrowLeft, LuSearch, LuShield, LuShieldAlert, LuUserMinus, LuUserPlus, LuX } from "react-icons/lu";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import emptyDp from "../assets/emptyDP.jpg";


const AllMembers = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);

    const [loading, setLoading] = useState(true);
    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/community/get-community/${id}`, { withCredentials: true });
                setCommunity(res.data.community);
                setMembers(res.data.community.members || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching community", error);
                navigate("/");
            }
        };
        if (userData) fetchCommunity();
    }, [id, userData, navigate]);

    // Quick checks for the CURRENT logged-in user
    const isCurrentPandit = community?.moderators?.some(mod => mod._id === userData?._id);

    // Helpers to check roles of the users in the list
    const isCreator = (userId) => community?.creator === userId;
    const isModerator = (userId) => community?.moderators?.some(mod => mod._id === userId);

    // Filter members based on the search bar
    const filteredMembers = members.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ACTION: Promote to Moderator
    const handlePromote = async (targetUserId, userName) => {
        const result = await Swal.fire({
            title: `Promote ${userName}?`,
            text: "They will gain full moderator permissions.",
            icon: "question",
            showCancelButton: true,
            background: "#0f2320",
            color: "#fff",
            confirmButtonText: "Yes, Promote"
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axios.put(`${serverUrl}/api/community/promote-member/${id}/${targetUserId}`, {}, { withCredentials: true });

            // Update the local state so the badge changes instantly
            setCommunity(prev => ({
                ...prev,
                moderators: res.data.moderators
            }));
            Swal.fire({ title: "Promoted!", icon: "success", background: "#0f2320", color: "#fff", timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ title: "Error", text: error.response?.data?.message, icon: "error", background: "#0f2320", color: "#fff" });
        }
    };

    // ACTION: Demote to Normal Member
    const handleDemote = async (targetUserId, userName) => {
        const result = await Swal.fire({
            title: `Demote ${userName}?`,
            text: "They will lose all moderator permissions.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            background: "#0f2320",
            color: "#fff",
            confirmButtonText: "Yes, Demote"
        });

        if (!result.isConfirmed) return;

        try {
            const res = await axios.put(`${serverUrl}/api/community/demote-member/${id}/${targetUserId}`, {}, { withCredentials: true });

            setCommunity(prev => ({
                ...prev,
                moderators: res.data.moderators
            }));
            Swal.fire({ title: "Demoted", icon: "success", background: "#0f2320", color: "#fff", timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ title: "Error", text: error.response?.data?.message, icon: "error", background: "#0f2320", color: "#fff" });
        }
    };

    // ACTION: Remove from Community
    const handleRemove = async (targetUserId, userName) => {
        const result = await Swal.fire({
            title: `Remove ${userName}?`,
            text: "They will be kicked out of the community.",
            icon: "error",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            background: "#0f2320",
            color: "#fff",
            confirmButtonText: "Yes, Remove"
        });

        if (!result.isConfirmed) return;

        try {
            await axios.put(`${serverUrl}/api/community/remove-member/${id}/${targetUserId}`, {}, { withCredentials: true });

            // Remove them from the local list
            setMembers(prev => prev.filter(member => member._id !== targetUserId));
            Swal.fire({ title: "Removed", icon: "success", background: "#0f2320", color: "#fff", timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ title: "Error", text: error.response?.data?.message, icon: "error", background: "#0f2320", color: "#fff" });
        }
    };

    if (loading) return <div className="h-screen flex justify-center items-center bg-[#091413]"><ClipLoader color="#4ade80" size={50} /></div>;

    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white flex justify-center py-12 px-4">
            <div className="w-full max-w-3xl bg-[#0f2320] rounded-2xl p-6 sm:p-8 border border-gray-700 shadow-xl">

                <button onClick={() => navigate(`/community-page/${id}`)} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors font-medium">
                    <LuArrowLeft className="mr-2" /> Back to {community.name}
                </button>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">Community Members</h1>
                    <p className="text-gray-400 text-sm mb-6">Connect with {members.length} people in your neighborhood.</p>

                    {/* Search Bar */}
                    <div className="relative w-full">
                        <LuSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search members by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#091413] text-white placeholder-gray-500 border border-gray-700 outline-none focus:border-green-600 transition-colors"
                        />
                    </div>
                </div>

                <div className="space-y-3 mt-6">
                    {filteredMembers.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 bg-[#091413] rounded-xl border border-gray-800">
                            No members found matching "{searchQuery}"
                        </div>
                    ) : (
                        filteredMembers.map(member => {
                            const userIsCreator = isCreator(member._id);
                            const userIsModerator = isModerator(member._id);
                            // We shouldn't let a Pandit demote/remove themselves from this list (they can use the "Leave" button on the main page)
                            const isSelf = member._id === userData._id;

                            return (
                                <div key={member._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#091413] border border-gray-800 p-4 rounded-xl hover:border-gray-600 transition-colors gap-4">

                                    {/* User Info & Badges */}
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={member.profilePicture || emptyDp}
                                            alt={`${member.name}'s avatar`}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                                        />
                                        <div>
                                            <span className="text-gray-100 font-bold text-lg flex items-center">
                                                {member.name} {isSelf && <span className="text-xs text-gray-500 ml-2 font-normal">(You)</span>}
                                            </span>

                                            {/* Role Badges */}
                                            <div className="mt-1 flex gap-2">
                                                {userIsCreator && (
                                                    <span className="flex items-center text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                        <LuShieldAlert size={12} className="mr-1" /> Creator
                                                    </span>
                                                )}
                                                {userIsModerator && !userIsCreator && (
                                                    <span className="flex items-center text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                                                        <LuShield size={12} className="mr-1" /> Pandit
                                                    </span>
                                                )}
                                                {!userIsModerator && (
                                                    <span className="text-xs font-medium text-gray-500 px-2 py-0.5 rounded-full bg-gray-800 border border-gray-700">
                                                        Member
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons (ONLY visible to Current Pandits, and hidden for the Creator/Self) */}
                                    {isCurrentPandit && !userIsCreator && !isSelf && (
                                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                                            {userIsModerator ? (
                                                <button
                                                    onClick={() => handleDemote(member._id, member.name)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-900/20 text-orange-400 text-sm font-bold rounded-lg hover:bg-orange-600 hover:text-white transition-all border border-orange-900/50"
                                                >
                                                    <LuUserMinus size={16} /> Demote
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePromote(member._id, member.name)}
                                                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-900/20 text-blue-400 text-sm font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all border border-blue-900/50"
                                                >
                                                    <LuShield size={16} /> Promote
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handleRemove(member._id, member.name)}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-900/20 text-red-500 text-sm font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-900/50"
                                            >
                                                <LuX size={16} /> Kick
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default AllMembers;