import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { ClipLoader } from "react-spinners";
import { LuSearch } from "react-icons/lu";
import CommunityCard from '../components/CommunityCard';
import { useSelector } from 'react-redux';

const Home = () => {
  const [localCommunities, setLocalCommunities] = useState([]);
  const [exploreCommunities, setExploreCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await axios.get(`${serverUrl}/api/community/all-communities`, {
        withCredentials: true
      });
      setLocalCommunities(response.data.localCommunities);
      setExploreCommunities(response.data.exploreCommunities);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setLoading(false);
    }
  };

  const filterCommunities = (communities) => {
    if (!searchQuery) return communities;
    const lowerQuery = searchQuery.toLowerCase();
    return communities.filter(c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.city.toLowerCase().includes(lowerQuery) ||
      c.state.toLowerCase().includes(lowerQuery)
    );
  };

  const displayLocal = filterCommunities(localCommunities);
  const displayExplore = filterCommunities(exploreCommunities);

  const { isSearchVisible } = useSelector(state => state.user);

  if (loading) {
    return (
      // ✅ Dark loader background
      <div className="w-full h-screen flex justify-center items-center bg-[#091413]">
        <ClipLoader size={50} color="#4ade80" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-linear-to-b from-black to-gray-900 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-3xl">

        {/* Header & Search Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-4">
            <h1 className="text-3xl font-bold text-white">Discover & Join Hubs</h1>
          </div>

          {isSearchVisible && (
            <div className="relative w-full h-12">
              {/* ✅ Lighter icon for dark bg */}
              <LuSearch className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, city, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // ✅ Dark background, light text, dark border & focus ring
                className="w-full h-full pl-12 pr-4 rounded-2xl bg-[#0f2320] text-white placeholder-gray-500 border-2 border-gray-700 outline-none focus:border-green-600 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Local Communities Section */}
        {displayLocal.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Hubs near you</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayLocal.map(community => (
                <CommunityCard key={community._id} community={community} />
              ))}
            </div>
          </div>
        )}

        {/* Explore Communities Section */}
        {displayExplore.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-100 mb-4">
              {searchQuery ? "Other matching hubs" : "Discover the Nation"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayExplore.map(community => (
                <CommunityCard key={community._id} community={community} />
              ))}
            </div>
          </div>
        )}

        {displayLocal.length === 0 && displayExplore.length === 0 && (
          // ✅ Slightly brighter for readability on dark bg
          <div className="text-center text-gray-400 mt-10">
            <p>No communities found. Be the first to start one!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;