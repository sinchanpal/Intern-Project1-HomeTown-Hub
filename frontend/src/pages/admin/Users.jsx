import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Swal from 'sweetalert2';
import { LuTrash2, LuUser, LuSearch } from 'react-icons/lu';
import { useSelector } from 'react-redux';
import emptyDp from '../../assets/emptyDP.jpg'
import { serverUrl } from '../../App';

const Users = () => {
    const { userData } = useSelector(state => state.user);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/admin/users`, {
                    withCredentials: true
                });
                setUsers(res.data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId, userName) => {
        // Prevent deleting yourself
        if (userId === userData._id) {
            Swal.fire({
                icon: 'error',
                title: 'Action Denied',
                text: 'You cannot delete your own admin account!',
                background: '#0f2320',
                color: '#fff'
            });
            return;
        }

        const result = await Swal.fire({
            title: `Delete ${userName}?`,
            text: "This action cannot be undone. They will lose access to Hometown Hub.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete user!"
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${serverUrl}/api/admin/users/${userId}`, {
                    withCredentials: true
                });

                // Remove the user from the UI instantly
                setUsers(users.filter(u => u._id !== userId));

                Swal.fire({
                    title: "Deleted!",
                    text: "User has been removed from the platform.",
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
                    text: error.response?.data?.message || 'Failed to delete user.',
                    background: '#0f2320',
                    color: '#fff'
                });
            }
        }
    };

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-gray-400">View and manage all members of Hometown Hub.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#16191f] border border-gray-700 text-white rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[#16191f] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0f1115] border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">User</th>
                                <th className="p-4 font-medium">Role</th>
                                <th className="p-4 font-medium">Location</th>
                                <th className="p-4 font-medium">Joined</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-800/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.profilePicture || emptyDp}
                                                    alt="avatar"
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-700"
                                                />
                                                <div>
                                                    <p className="text-white font-medium">{user.name}</p>
                                                    <p className="text-gray-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                    'bg-gray-800 text-gray-400'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300 text-sm capitalize">
                                            {user.city}, {user.state}
                                        </td>
                                        <td className="p-4 text-gray-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            {/* Don't show delete button for the currently logged in admin */}
                                            {user._id !== userData._id && (
                                                <button
                                                    onClick={() => handleDeleteUser(user._id, user.name)}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <LuTrash2 size={18} />
                                                </button>
                                            )}
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

export default Users;