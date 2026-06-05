import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSocket } from '../context/SocketContext';

import { TiHome } from "react-icons/ti";
import { LuSearch, LuBell } from "react-icons/lu";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi2";
import { setSearchVisible, toggleSearchBar } from '../redux/userSlice';

const Nav = () => {
    const { userData } = useSelector(state => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Notification States
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    //Hook into the Socket pipeline!
    const { socket } = useSocket();

    // 1. Fetch missed notifications on load
    useEffect(() => {
        if (!userData) return;

        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/user/notifications`, {
                    withCredentials: true
                });
                const fetchedNotifs = res.data.notifications;
                setNotifications(fetchedNotifs);

                // Count how many are unread
                const unread = fetchedNotifs.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        fetchNotifications();
    }, [userData]);

    // 2. Listen for LIVE notifications from the Socket
    useEffect(() => {
        if (!socket) return;

        socket.on("newNotification", (newNotif) => {
            // Add it to the top of the list and increase the red badge
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        // Cleanup listener when component unmounts
        return () => {
            socket.off("newNotification");
        };
    }, [socket]);

    // 3. Handle opening the dropdown and marking as read
    const handleBellClick = async () => {
        setIsDropdownOpen(!isDropdownOpen);

        // If we are opening it and we have unread alerts, tell the DB we saw them!
        if (!isDropdownOpen && unreadCount > 0) {
            try {
                await axios.put(`${serverUrl}/api/user/notifications/mark-read`, {}, {
                    withCredentials: true
                });
                setUnreadCount(0); // Clear the red badge instantly
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true }))); // Mark local state as read
            } catch (error) {
                console.error("Error marking notifications as read", error);
            }
        }
    };

    const handleSearchClick = () => {
        if (location.pathname !== '/' && location.pathname !== '/my-hubs') {
            navigate('/');
            dispatch(setSearchVisible(true));
        } else {
            dispatch(toggleSearchBar());
        }
    };

    if (!userData) return null;

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1a1f23] border border-gray-700 rounded-full shadow-2xl px-8 py-3.5 flex justify-between items-center gap-8 z-50">

            {/* Home */}
            <TiHome
                onClick={() => { setIsDropdownOpen(false); navigate('/'); }}
                className={`w-6 h-6 cursor-pointer transition-colors ${location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            />

            {/* Search */}
            <LuSearch
                onClick={() => { setIsDropdownOpen(false); handleSearchClick(); }}
                className={`w-6 h-6 cursor-pointer transition-colors text-gray-400 hover:text-white`}
            />

            {/* Create Hub */}
            <BsFillPlusCircleFill
                onClick={() => { setIsDropdownOpen(false); navigate('/create-community'); }}
                className={`w-7 h-7 cursor-pointer transition-colors ${location.pathname === '/create-community' ? 'text-green-400' : 'text-green-600 hover:text-green-500'}`}
            />

            {/* My Hubs */}
            <HiUsers
                onClick={() => { setIsDropdownOpen(false); navigate('/my-hubs'); }}
                className={`w-6 h-6 cursor-pointer transition-colors ${location.pathname === '/my-hubs' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            />

            {/* NEW: Notification Bell */}
            <div className="relative">
                <div onClick={handleBellClick} className="relative cursor-pointer">
                    <LuBell className={`w-6 h-6 transition-colors ${isDropdownOpen || unreadCount > 0 ? 'text-white' : 'text-gray-400 hover:text-white'}`} />

                    {/* The Red Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#1a1f23]">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>

                {/* Dropdown Menu (Opens UPWARDS because the nav is at the bottom) */}
                {isDropdownOpen && (
                    <div className="absolute bottom-12 -right-10 w-80 bg-[#1a1f23] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col mb-2 animate-fade-in-up">
                        <div className="p-4 border-b border-gray-700 bg-[#0f2320]">
                            <h3 className="font-bold text-white text-lg">Notifications</h3>
                        </div>

                        <div className="max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-400 text-sm">
                                    You're all caught up!
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif._id}
                                        onClick={() => {
                                            setIsDropdownOpen(false);
                                            // Optional: If you want clicking to take them to the community
                                            if (notif.community) navigate(`/community-page/${notif.community._id || notif.community}`);
                                        }}
                                        className={`p-4 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer flex gap-3 items-start ${!notif.isRead ? 'bg-[#0f2320]/50' : ''}`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-900/50 shrink-0 flex items-center justify-center border border-green-800">
                                            <LuBell className="text-green-500 w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-200">{notif.message}</p>
                                            <span className="text-xs text-gray-500 mt-1 block">
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Avatar */}
            <div
                className={`w-8 h-8 rounded-full cursor-pointer overflow-hidden border-2 transition-colors ${location.pathname === '/edit-profile' ? 'border-white' : 'border-gray-500 hover:border-gray-300'}`}
                onClick={() => { setIsDropdownOpen(false); navigate('/edit-profile'); }}
            >
                {userData.profilePicture ? (
                    <img src={userData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {userData.name ? userData.name[0] : 'U'}
                    </div>
                )}
            </div>

        </div>
    );
}

export default Nav;