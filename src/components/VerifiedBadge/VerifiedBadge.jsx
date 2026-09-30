import React from "react";
import styles from "./VerifiedBadge.module.css";

const VerifiedBadge = ({ className = "", style = {} }) => {
  return (
    <span className={`${styles.verifiedBadge} ${className}`} style={style}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      <span>Verified</span>
    </span>
  );
};

export default VerifiedBadge;
