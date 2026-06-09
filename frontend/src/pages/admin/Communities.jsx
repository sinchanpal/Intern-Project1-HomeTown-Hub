import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Swal from 'sweetalert2';
import { LuTrash2, LuSearch, LuMessageSquare, LuUsers } from 'react-icons/lu';
import { serverUrl } from '../../App';

const Communities = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/admin/communities`, {
                    withCredentials: true
                });

                setCommunities(res.data.communities || []);

            } catch (error) {
                console.error("Error fetching communities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCommunities();
    }, []);

    const handleDeleteCommunity = async (communityId, communityName) => {
        const result = await Swal.fire({
            title: `Delete ${communityName}?`,
            text: "This action cannot be undone. The community and ALL its posts will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete community!"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${serverUrl}/api/admin/communities/${communityId}`, {
                    withCredentials: true
                });

                // Remove the community from the UI instantly
                setCommunities(prev => prev.filter(c => c._id !== communityId));

                Swal.fire({
                    title: "Deleted!",
                    text: "Community has been removed.",
                    icon: "success",
                    background: '#0f2320',
                    color: '#fff',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to delete community.',
                    background: '#0f2320',
                    color: '#fff'
                });
            }
        }
    };

    const filteredCommunities = communities.filter(community =>
        community?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community?.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Community Oversight</h1>
                    <p className="text-gray-400">Manage all local hubs across the platform.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search hubs by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#16191f] border border-gray-700 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-emerald-500 transition-colors"
                    />
                </div>
            </div>

            {/* Communities Table */}
            <div className="bg-[#16191f] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0f1115] border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Hub Name</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium">Moderators</th>
                                <th className="p-4 font-medium">Stats</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">Loading communities...</td>
                                </tr>
                            ) : filteredCommunities.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No communities found.</td>
                                </tr>
                            ) : (
                                filteredCommunities.map((community) => (
                                    <tr key={community._id} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                                    <LuMessageSquare size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-white font-bold">{community?.name}</p>
                                                    <p className="text-gray-500 text-xs">Created: {new Date(community?.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm capitalize">
                                            {community?.state} , {community?.city}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {community?.moderators?.map((mod, index) => (
                                                    <div key={index} className=" h-8 w-8 rounded-full ring-2 ring-[#16191f] bg-gray-700 flex items-center justify-center text-xs text-white" title={mod.name}>
                                                        {mod.profilePicture ? (
                                                            <img src={mod.profilePicture} alt="" className="h-full w-full rounded-full object-cover" />
                                                        ) : (
                                                            mod.name[0]
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-gray-400 text-sm bg-gray-800/50 w-fit px-3 py-1 rounded-full border border-gray-700">
                                                <LuUsers size={14} />
                                                <span className="font-bold text-gray-200">{community.members?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteCommunity(community._id, community.name)}
                                                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Community"
                                            >
                                                <LuTrash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Communities;