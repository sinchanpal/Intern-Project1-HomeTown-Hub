import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { ClipLoader } from "react-spinners";
import { LuSearch } from "react-icons/lu";
import CommunityCard from '../components/CommunityCard';
import { MdHub } from "react-icons/md";

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

  // Smart Filtering Logic for the Search Bar
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

  if (loading) {
    return <div className="w-full h-screen flex justify-center items-center bg-gray-50"><ClipLoader size={50} /></div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#fbf8f2] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-3xl">

        {/* Header & Search Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-1 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Discover & Join Hubs</h1>
            <MdHub className='ml-2' size={27}/>
          </div>
          
          <div className="relative w-full h-12">
            <LuSearch className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search by name, city, or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full pl-12 pr-4 rounded-2xl border-2 border-gray-300 outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        {/* Local Communities Section */}
        {displayLocal.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Hubs near you</h2>
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">
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
          <div className="text-center text-gray-500 mt-10">
            <p>No communities found. Be the first to start one!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
