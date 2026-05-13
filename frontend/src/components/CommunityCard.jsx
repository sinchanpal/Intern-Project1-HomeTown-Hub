import React, { useState } from 'react';
import { serverUrl } from '../App';
import axios from 'axios';
import { LuMapPin, LuUsers } from "react-icons/lu";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const CommunityCard = ({ community }) => {
    // Grab the logged-in user's data from Redux
    const { userData } = useSelector((state) => state.user);
    const navigate = useNavigate();

    // Check if the user is ALREADY in the database members array
    const alreadyMember = userData && community?.members?.includes(userData._id);
    // Track if they click "Join" right now during this active session
    const [hasJustJoined, setHasJustJoined] = useState(false);
    //The final check: Are they a member from before, OR did they just join?
    const isMember = alreadyMember || hasJustJoined;

    const handleJoin = async (e) => {
        e.stopPropagation(); // <-- CRITICAL: Stops the card from navigating when the button is clicked!
        try {
            await axios.post(`${serverUrl}/api/community/join-community/${community._id}`, {}, {
                withCredentials: true
            });
            // Update UI instantly to show "Joined"
            setHasJustJoined(true);
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
            {/* Dynamic Background Setup */}
            <div
                className={`p-5 rounded-2xl border-2 shadow-md mb-4 flex flex-col justify-between min-h-55 bg-cover bg-center ${!community.coverImage ? 'bg-white border-[#1a1f23]' : 'border-transparent'
                    }`}
                style={community.coverImage ? {
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.85)), url(${community.coverImage})`
                } : {}}
            >
                <div>
                    {/* Dynamic Text Colors */}
                    <h3 className={`text-xl font-bold mb-1 ${community.coverImage ? 'text-white' : 'text-gray-900'}`}>
                        {community.name}
                    </h3>

                    <div className={`flex items-center text-sm mb-3 ${community.coverImage ? 'text-gray-300' : 'text-gray-500'}`}>
                        <LuMapPin className="mr-1" size={16} />
                        <span className="capitalize">{community.city}, {community.state}</span>
                        <LuUsers className="ml-4 mr-1" size={16} />
                        {/* Temporarily add 1 to the count in the UI if just joined */}
                        <span>{community.memberCount + (hasJustJoined && !alreadyMember ? 1 : 0)} Members</span>
                    </div>

                    <p className={`text-sm mb-5 line-clamp-2 ${community.coverImage ? 'text-gray-200' : 'text-gray-700'}`}>
                        {community.description}
                    </p>
                </div>

                <button
                    onClick={handleJoin}
                    disabled={isMember}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${isMember
                        ? "bg-green-100 text-green-700 border-2 border-green-200 cursor-not-allowed"
                        // If there is an image, make the button white so it pops against the dark background!
                        : community.coverImage
                            ? "bg-white text-black hover:bg-gray-200"
                            : "bg-black text-white hover:bg-gray-800"
                        }`}
                >
                    {isMember ? "Joined ✓" : "Join Community"}
                </button>
            </div>
        </div>
    )
}

export default CommunityCard;