import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import { useSelector } from 'react-redux';
import useGetCurrentUserData from './hooks/useGetCurrentUserData';
import { ClipLoader } from 'react-spinners';
import ForgotPassword from './pages/ForgotPassword';

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

    <Routes>
      <Route path='/' element={userData ? <Home /> : <Navigate to={'/signin'} />} />
      <Route path='/signup' element={!userData ? <SignUp /> : <Navigate to={'/'} />} />
      <Route path='/signin' element={!userData ? <SignIn /> : <Navigate to={'/'} />} />
      <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />
    </Routes>

  )
}

export default App
