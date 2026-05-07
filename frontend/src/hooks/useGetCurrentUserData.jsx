import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import { useDispatch } from 'react-redux';

const useGetCurrentUserData = () => {

    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchUserData = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/getCurrentUser`, { withCredentials: true });
                dispatch(setUserData(result.data)); // Set the user data in the Redux store
            } catch (error) {
                console.error("Error fetching current user data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, [dispatch])

    return loading; // <-- Return the loading status
}

export default useGetCurrentUserData;
