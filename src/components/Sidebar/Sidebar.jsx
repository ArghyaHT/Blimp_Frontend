import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../../context/AuthContext";
import { del } from "idb-keyval";

const Sidebar = () => {
  const {
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    userId,
    setUserId,
  } = useAuth();

  const navigate = useNavigate();

  const logout_handler = async () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("usersignin");
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);

    const keysToRemove = [
      "beneficiaryDetail",
      "campaignTitle",
      "selectedCampaingDescription",
      "selectedCategory",
      "selectedCountry",
      "targetedAmount",
      "userEmail",
      "userFullname",
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    await del("bannerImage");
    await del("campaignImages");

    navigate("/login-signup");
  };

  return (
    <div className={styles.sidebar}>
      <NavLink
        to="/account"
        end
        onClick={() => window.scrollTo(0, 0)}
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Profile
      </NavLink>
      <NavLink
        to="/account/active-campaigns"
        onClick={() => window.scrollTo(0, 0)}
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Active Campaigns
      </NavLink>

      <NavLink
        to="/account/draft-campaigns"
        onClick={() => window.scrollTo(0, 0)}
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Draft Campaigns
      </NavLink>

      <NavLink
        to="/account/donation-history"
        onClick={() => window.scrollTo(0, 0)}
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Donation History
      </NavLink>

      <NavLink
        to="/account/bank-account"
        onClick={() => window.scrollTo(0, 0)}
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Bank Account
      </NavLink>

      <NavLink
        to="/account/change-password"
        onClick={() => window.scrollTo(0, 0)}
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        Change Password
      </NavLink>

      <button onClick={logout_handler} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
