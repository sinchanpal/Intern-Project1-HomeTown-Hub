import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuUsers, LuMessageSquare, LuArrowLeft, LuFlag, LuMenu, LuX } from 'react-icons/lu';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-black text-white relative">

            {/* Mobile Top Header (Only visible on small screens) */}
            <div className="md:hidden flex items-center justify-between p-4 bg-[#0f1115] border-b border-gray-800 w-full z-40">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                    Admin Portal
                </h2>
                <button 
                    onClick={() => setIsSidebarOpen(true)} 
                    className="text-gray-400 hover:text-white p-1"
                >
                    <LuMenu size={28} />
                </button>
            </div>

            {/* Dark Overlay for Mobile (Clicking outside closes the menu) */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar (Absolute on mobile, relative on desktop) */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1115] border-r border-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                            Admin Portal
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Hometown Hub Control</p>
                    </div>
                    {/* Mobile Close Button */}
                    <button className="md:hidden text-gray-400 hover:text-white p-1" onClick={closeSidebar}>
                        <LuX size={24} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLink
                        to="/admin"
                        end
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`
                        }
                    >
                        <LuLayoutDashboard size={20} />
                        <span className="font-medium">Overview</span>
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`
                        }
                    >
                        <LuUsers size={20} />
                        <span className="font-medium">Manage Users</span>
                    </NavLink>

                    <NavLink
                        to="/admin/communities"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`
                        }
                    >
                        <LuMessageSquare size={20} />
                        <span className="font-medium">Communities</span>
                    </NavLink>

                    <NavLink
                        to="/admin/reports"
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`
                        }
                    >
                        <LuFlag size={20} />
                        <span className="font-medium">Reports</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800/50"
                    >
                        <LuArrowLeft size={20} />
                        <span className="font-medium">Back to App</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-x-hidden overflow-y-auto bg-linear-to-b from-[#090b0e] to-black w-full h-[calc(100vh-68px)] md:h-screen">
                <Outlet />
            </div>

        </div>
    );
};

export default AdminLayout;