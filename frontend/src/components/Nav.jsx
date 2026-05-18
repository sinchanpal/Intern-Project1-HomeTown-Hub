import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TiHome } from "react-icons/ti";
import { LuSearch } from "react-icons/lu";
import { BsFillPlusCircleFill } from "react-icons/bs";
import { HiUsers } from "react-icons/hi2";
import { setSearchVisible, toggleSearchBar } from '../redux/userSlice';

const Nav = () => {
    const { userData } = useSelector(state => state.user);
    const navigate = useNavigate();
    const location = useLocation();

    // Do not show the navbar if the user is not logged in
    if (!userData) return null;

    const dispatch = useDispatch();

    //Here we dhow the search bar if the user clicks on the search icon.
    const handleSearchClick = () => {
        if (location.pathname !== '/' && location.pathname !== '/my-hubs') {
            // If they are on a different page, send them Home and force search open
            navigate('/');
            dispatch(setSearchVisible(true));
        }else{
            // If they are already Home, or on My Hubs, just toggle it open/closed
            dispatch(toggleSearchBar());
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1a1f23] border border-gray-700 rounded-full shadow-2xl px-8 py-3.5 flex justify-between items-center gap-8 z-50">

            {/* Home */}
            <TiHome
                onClick={() => navigate('/')}
                className={`w-6 h-6 cursor-pointer transition-colors ${location.pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            />

            {/* Search (Navigates to Home for now, we can add the toggle logic later) */}
            <LuSearch
                onClick={handleSearchClick}
                className={`w-6 h-6 cursor-pointer transition-colors text-gray-400 hover:text-white`}
            />

            {/* Create Hub */}
            <BsFillPlusCircleFill
                onClick={() => navigate('/create-community')}
                className={`w-7 h-7 cursor-pointer transition-colors ${location.pathname === '/create-community' ? 'text-green-400' : 'text-green-600 hover:text-green-500'}`}
            />

            {/* My Hubs (Placeholder for our next feature!) */}
            <HiUsers
                onClick={() => navigate('/my-hubs')}
                className={`w-6 h-6 cursor-pointer transition-colors ${location.pathname === '/my-hubs' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            />

            {/* Profile Avatar -> Navigates to Edit Profile */}
            <div
                className={`w-8 h-8 rounded-full cursor-pointer overflow-hidden border-2 transition-colors ${location.pathname === '/edit-profile' ? 'border-white' : 'border-gray-500 hover:border-gray-300'}`}
                onClick={() => navigate('/edit-profile')}
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