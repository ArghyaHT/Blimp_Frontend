import React, { useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'

const ProtectedRoute = () => {
    let usersignin = false;
    try {
        const raw = localStorage.getItem("usersignin");
        if (raw) {
            usersignin = JSON.parse(raw) === true || raw === "true";
        }
    } catch (e) {
        usersignin = localStorage.getItem("usersignin") === "true";
    }

    if (!usersignin) {
        // If i use this then i don't need useEffect 
        return <Navigate to="/" replace />;
    }

    return (
        <Outlet />
    )
}

export default ProtectedRoute