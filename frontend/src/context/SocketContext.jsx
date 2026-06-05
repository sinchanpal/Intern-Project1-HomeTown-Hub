import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { serverUrl } from "../App"; // Adjust this path if your serverUrl is located elsewhere

// Create the Context
const SocketContext = createContext();

// Create a custom hook so any component can easily use the socket!
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { userData } = useSelector((state) => state.user);

    useEffect(() => {
        // If a user is logged in, connect them to the Socket server!
        if (userData) {
            const socketInstance = io(serverUrl, {
                query: {
                    userId: userData._id, // This is how the backend knows WHO connected
                },
            });

            setSocket(socketInstance);

            // Cleanup: When the user logs out or closes the app, disconnect safely
            return () => socketInstance.close();
        } else {
            // If there is no user data (logged out), ensure the socket is closed
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [userData]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};