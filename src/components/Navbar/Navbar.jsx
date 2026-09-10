import React, { useEffect, useState } from "react";
import style from "./Navbar.module.css";
import blimpLogoBlack from "../../assets/BlimpLogo1.png";
import { AccountIcon, MenuIcon, ProfileIcon, SearchIcon } from "../../icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, setIsAuthenticated, user } = useAuth();
  const location = useLocation();

  const navigate = useNavigate();

  const menus = [
    {
      name: "How it works",
      url: "/works",
    },
    {
      name: "About Us",
      url: "/aboutus",
    },
    {
      name: "News",
      url: "/news-blog",
    },
    {
      name: "Contact Us",
      url: "/contact-us",
    },
  ];

  return (
    <header className={style.header}>
      <div>
        <div>
          <div className={style.logoContainer}>
            <a href="/" aria-label="Go to Home">
              <img
                src={blimpLogoBlack}
                alt="Blimp Company Logo"
                className={style.logo}
              />
            </a>
          </div>

          <nav className={style.nav} aria-label="Main Navigation">
            <ul>
              {menus.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.url}
                    className={`${style.navLink} ${location.pathname === item.url ? style.navLinkActive : ""
                      }`}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div>
          {location.pathname !== "/discover" ? (
            <button
              onClick={() => {
                navigate("/discover");
              }}
            >
              <SearchIcon />
              <span>Search</span>
            </button>
          ) : (
            <div></div>
          )}

          {isAuthenticated && user?.profile_picture ? (
            <button
              className={style.profileBtn}
              onClick={() => navigate("/account")}
            >
              <img
                src={user?.profile_picture}
                alt=""
                width={"100%"}
                height={"100%"}
                style={{ borderRadius: "50%" }}
              />
            </button>
          ) : isAuthenticated ? (
            <button
              className={style.profileBtn}
              onClick={() => navigate("/account")}
            >
              <ProfileIcon />
            </button>
          ) : (
            <button
              className={style.signinBtn}
              onClick={() => navigate("/login-signup")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
