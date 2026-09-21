import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
    let authenticatedUser = false;
    try {
        const raw = localStorage.getItem("usersignin");
        if (raw) {
            authenticatedUser = JSON.parse(raw) === true || raw === "true";
        }
    } catch (e) {
        authenticatedUser = localStorage.getItem("usersignin") === "true";
    }
    const loggedinUserId = localStorage.getItem("userId") || null

    useEffect(() => {
        setUserId(loggedinUserId)
        setIsAuthenticated(authenticatedUser)
    }, [])


    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        if (userId) {
            const fetchLoggedinUser = async () => {
                try {
                    const { data } = await api.post("/get-profile", {
                        user_id: userId
                    });

                    if (data.code === 200) {
                        setUser(data.data)
                    } else {
                        console.log("Error fetching this api ", data)
                    }
                } catch (error) {
                    console.log("Error in api ", error)
                }
            }

            fetchLoggedinUser()
        }

    }, [userId])


    const value = {
        user,
        setUser,
        isAuthenticated,
        setIsAuthenticated,
        userId,
        setUserId
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
