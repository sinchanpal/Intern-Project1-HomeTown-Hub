import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import { useSelector } from 'react-redux';
import useGetCurrentUserData from './hooks/useGetCurrentUserData';
import { ClipLoader } from 'react-spinners';
import ForgotPassword from './pages/ForgotPassword';
import CreateCommunity from './pages/CreateCommunity';
import CommunityPage from './pages/CommunityPage';
import EditCommunity from './pages/EditCommunity';
import EditProfile from './pages/EditProfile';
import Nav from './components/Nav';
import MyHubs from './pages/MyHubs';
import PendingMembers from './pages/PendingMembers';
import AllMembers from './pages/AllMembers';

export const serverUrl = "http://localhost:8000";

function App() {

  const loading = useGetCurrentUserData() // call this fun to get current user data when the app loads & Get the loading state 

  const { userData } = useSelector(state => state.user);

  // <-- Prevent routes from rendering until the backend finishes checking the cookie
  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex justify-center items-center">
        <ClipLoader color='white' size={50} />
      </div>
    );
  }

  return (

    // Added pb-24 here so the bottom content doesn't get hidden behind the Nav!
    <div className="min-h-screen relative pb-14 bg-gray-900">
      <Routes>
        <Route path='/' element={userData ? <Home /> : <Navigate to={'/signin'} />} />
        <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={'/'} />} />
        <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={'/'} />} />
        <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path='/create-community' element={userData ? <CreateCommunity /> : <Navigate to={'/signin'} />} />
        <Route path='/community-page/:id' element={userData ? <CommunityPage /> : <Navigate to={'/signin'} />} />
        <Route path='/community-edit/:id' element={userData ? <EditCommunity /> : <Navigate to={'/signin'} />} />
        <Route path="/edit-profile" element={userData ? <EditProfile /> : <Navigate to={'/signin'} />} />
        <Route path="/my-hubs" element={userData ? <MyHubs /> : <Navigate to={'/signin'} />} />
        <Route path="/pending-members/:id" element={<PendingMembers />} />
        <Route path="/all-members/:id" element={<AllMembers />} />
      </Routes>

      {/* Render Nav globally! It will hide itself if user is not logged in */}
      <Nav />
    </div>

  )
}

export default App
