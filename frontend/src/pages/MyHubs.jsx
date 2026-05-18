import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { ClipLoader } from "react-spinners";
import { LuSearch, LuUsers } from "react-icons/lu";
import CommunityCard from '../components/CommunityCard';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const MyHubs = () => {
    const [myCommunities, setMyCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    // Reusing the search toggle state from Redux!
    const { isSearchVisible } = useSelector(state => state.user);

    useEffect(() => {
        const fetchMyHubs = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/community/my-hubs`, {
                    withCredentials: true
                });
                setMyCommunities(response.data.myCommunities);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching my hubs:", error);
                setLoading(false);
            }
        };
        fetchMyHubs();
    }, []);

    // Filter logic for searching their joined hubs
    const filteredHubs = myCommunities.filter(c => {
        if (!searchQuery) return true;
        const lowerQuery = searchQuery.toLowerCase();
        return (
            c.name.toLowerCase().includes(lowerQuery) ||
            c.city.toLowerCase().includes(lowerQuery) ||
            c.state.toLowerCase().includes(lowerQuery)
        );
    });

    if (loading) {
        return (
            <div className="w-full h-screen flex justify-center items-center bg-[#091413]">
                <ClipLoader size={50} color="#4ade80" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-linear-to-b from-black to-gray-900 flex flex-col items-center py-8 px-4 pb-24">
            <div className="w-full max-w-3xl">

                {/* Header & Search Bar */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <LuUsers className='text-emerald-400' size={32} />
                        <h1 className="text-3xl font-bold text-white">My Hubs</h1>
                    </div>

                    {isSearchVisible && (
                        <div className="relative w-full h-12">
                            <LuSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search your hubs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-full pl-12 pr-4 rounded-2xl bg-[#0f2320] text-white placeholder-gray-500 border-2 border-gray-700 outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    )}
                </div>

                {/* Communities Grid */}
                {filteredHubs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredHubs.map(community => (
                            <CommunityCard key={community._id} community={community} />
                        ))}
                    </div>
                ) : (
                    // Empty State UI
                    <div className="bg-[#0f2320] rounded-2xl border-2 border-gray-700 p-10 text-center shadow-sm mt-8 flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <LuUsers size={30} className="text-gray-500" />
                        </div>
                        {searchQuery ? (
                            <>
                                <h2 className="text-xl font-bold text-gray-100 mb-2">No matching hubs</h2>
                                <p className="text-gray-400">We couldn't find any of your hubs matching that search.</p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-gray-100 mb-2">You haven't joined any Hubs yet!</h2>
                                <p className="text-gray-400 mb-6">Discover communities in your area or start your own neighborhood group.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-500 transition-all"
                                >
                                    Explore Discover Page
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyHubs;