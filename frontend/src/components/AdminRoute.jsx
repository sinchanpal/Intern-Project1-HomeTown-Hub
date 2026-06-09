import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminRoute = () => {
    const { userData } = useSelector((state) => state.user);

    // If there is no user, or the user's role is NOT admin, kick them out to the home page!
    if (!userData || userData.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // If they are an admin, render the nested admin pages
    return <Outlet />;
};

export default AdminRoute;