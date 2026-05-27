import React, { useState } from 'react';
import { serverUrl } from '../App';
import axios from 'axios';
import { LuMapPin, LuUsers } from "react-icons/lu";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CommunityCard = ({ community }) => {
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();

    // Check current status from the database data
    const alreadyMember = userData && community?.members?.includes(userData._id);
    const alreadyPending = userData && community?.pendingMembers?.includes(userData._id);

    // Local state to instantly update the UI when they click the button
    const [hasJustRequested, setHasJustRequested] = useState(false);

    // Final derived states
    const isMember = alreadyMember;
    const isPending = alreadyPending || hasJustRequested;

    const handleJoin = async (e) => {
        e.stopPropagation();
        try {
            await axios.post(`${serverUrl}/api/community/join-community/${community._id}`, {}, {
                withCredentials: true
            });
            // Instantly change button to pending state
            setHasJustRequested(true);
        } catch (error) {
            console.error("Error joining community:", error);
            alert(error.response?.data?.message || "Could not join community");
        }
    };

    return (
        <div
            onClick={() => navigate(`/community-page/${community._id}`)}
            className="cursor-pointer transition-transform hover:-translate-y-1"
        >
            <div
                className={`p-5 border-2 shadow-md mb-4 flex flex-col justify-between min-h-55 bg-cover bg-center rounded-2xl overflow-hidden ${!community.coverImage ? 'bg-[#0f2320] border-gray-700' : 'border-transparent'}`}
                style={community.coverImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8)), url(${community.coverImage})`
                } : {}}
            >
                <div>
                    <h3 className={`text-xl font-bold mb-1 ${community.coverImage ? 'text-white' : 'text-white'}`}>
                        {community.name}
                    </h3>

                    <div className={`flex items-center text-sm mb-3 ${community.coverImage ? 'text-gray-300' : 'text-gray-400'}`}>
                        <LuMapPin className="mr-1" size={16} />
                        <span className="capitalize">{community.city}, {community.state}</span>
                        <LuUsers className="ml-4 mr-1" size={16} />
                        {/* Member count stays the same until a Pandit approves them */}
                        <span>{community.memberCount} Members</span>
                    </div>

                    <p className={`text-sm mb-5 line-clamp-2 ${community.coverImage ? 'text-gray-200' : 'text-gray-300'}`}>
                        {community.description}
                    </p>
                </div>

                <button
                    onClick={handleJoin}
                    disabled={isMember || isPending}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${isMember
                        ? "bg-green-900 text-green-400 border-2 border-green-700 cursor-not-allowed"
                        : isPending
                            ? "bg-gray-800 text-gray-400 border-2 border-gray-700 cursor-not-allowed"
                            : community.coverImage
                                ? "bg-white text-black hover:bg-gray-200"
                                : "bg-green-700 text-white hover:bg-green-600"
                        }`}
                >
                    {isMember ? "Joined ✓" : isPending ? "Request Pending..." : "Join Community"}
                </button>
            </div>
        </div>
    );
};

export default CommunityCard;