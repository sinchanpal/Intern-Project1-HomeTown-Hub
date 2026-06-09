import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LuUsers, LuFileText, LuMessageSquare, LuTrendingUp } from 'react-icons/lu';
import { serverUrl } from '../../App';

const Overview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalCommunities: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/admin/stats`, {
                    withCredentials: true
                });
                setStats(res.data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
                <p className="text-gray-400">Welcome to the Super Admin control center.</p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Users Card */}
                <div className="bg-[#16191f] border border-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-blue-500/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Total Users</p>
                            <h3 className="text-4xl font-extrabold text-white">{stats.totalUsers}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                            <LuUsers size={24} />
                        </div>
                    </div>
                </div>

                {/* Communities Card */}
                <div className="bg-[#16191f] border border-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-emerald-500/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Active Hubs</p>
                            <h3 className="text-4xl font-extrabold text-white">{stats.totalCommunities}</h3>
                        </div>
                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                            <LuMessageSquare size={24} />
                        </div>
                    </div>
                </div>

                {/* Posts Card */}
                <div className="bg-[#16191f] border border-gray-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-purple-500/10 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-sm font-medium text-gray-400 mb-1">Total Posts</p>
                            <h3 className="text-4xl font-extrabold text-white">{stats.totalPosts}</h3>
                        </div>
                        <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                            <LuFileText size={24} />
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Actions / Info Section */}
            <div className="mt-10 bg-[#16191f] border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <LuTrendingUp className="text-emerald-400" /> Platform Status
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    All systems are operational. You are currently logged in as a Super Admin. Use the sidebar to navigate to specific management areas. As an admin, you have the ability to remove users and moderate community content to keep Hometown Hub safe.
                </p>
            </div>
        </div>
    );
};

export default Overview;