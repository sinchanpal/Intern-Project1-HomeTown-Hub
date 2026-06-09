import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard, LuUsers, LuMessageSquare, LuLogOut, LuArrowLeft, LuFlag } from 'react-icons/lu';

const AdminLayout = () => {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-black text-white">

            {/* Sidebar */}
            <div className="w-64 bg-[#0f1115] border-r border-gray-800 flex flex-col  md:flex">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                        Admin Portal
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Hometown Hub Control</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavLink
                        to="/admin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`
                        }
                    >
                        <LuLayoutDashboard size={20} />
                        <span className="font-medium">Overview</span>
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`
                        }
                    >
                        <LuUsers size={20} />
                        <span className="font-medium">Manage Users</span>
                    </NavLink>

                    {/* We will build the communities/reports pages later, but let's add the link now */}
                    <NavLink
                        to="/admin/communities"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'}`
                        }
                    >
                        <LuMessageSquare size={20} />
                        <span className="font-medium">Communities</span>
                    </NavLink>

                    <NavLink
                        to="/admin/reports"
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
            <div className="flex-1 overflow-y-auto bg-linear-to-b from-[#090b0e] to-black">
                {/* The <Outlet /> is where the specific admin pages (Overview, Users, etc.) will render! */}
                <Outlet />
            </div>

        </div>
    );
};

export default AdminLayout;