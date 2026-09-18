import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import styles from "./Account.module.css";
import Sidebar from "../../components/Sidebar/Sidebar";

const Account = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className={styles.container}>
      <div>
        {/* Left Sidebar */}
        <Sidebar /> 

        {/* Right Content */}
        <div className={styles.content}>
          <Outlet /> {/* This will load Profile, Orders, etc. */}
        </div>
      </div>
    </div>
  );
};

export default Account;
