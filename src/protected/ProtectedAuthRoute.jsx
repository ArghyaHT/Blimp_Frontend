import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'

const ProtectedAuthRoute = () => {
    let usersignin = false;
    try {
        const raw = localStorage.getItem("usersignin");
        if (raw) {
            usersignin = JSON.parse(raw) === true || raw === "true";
        }
    } catch (e) {
        usersignin = localStorage.getItem("usersignin") === "true";
    }

    if (usersignin) {
        return <Navigate to="/" replace />
    }

    return (
        <Outlet />
    )
}

export default ProtectedAuthRoute