import React from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import styles from "./ProgressBar.module.css";

const ProgressBar = ({
  raisedAmount,
  targetAmount,
  percentageAchieved,
  donationCount,
  currency,
  symbol,
  height = "auto",
}) => {
  const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "0";

    if (num >= 1_000_000_000)
      return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  return (
    <div
      className={styles.progressContainer}
      style={{
        height: height,
      }}
    >
      <div>
        <p>
          {symbol} {formatNumber(raisedAmount)} {currency} raised
        </p>
        <p>
          {symbol}
          {formatNumber(targetAmount)} goal - {formatNumber(donationCount)}{" "}
          donations
        </p>
      </div>

      <div style={{ width: "6rem", height: "6rem" }}>
        <CircularProgressbar
          value={percentageAchieved}
          text={`${percentageAchieved}%`}
          styles={buildStyles({
            // Rotation of path and trail, in number of turns (0-1)
            rotation: 0.25,

            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
            strokeLinecap: "butt",

            // Text size
            textSize: "2rem",

            // How long animation takes to go from one percentage to another, in seconds
            pathTransitionDuration: 0.5,

            // Can specify path transition in more detail, or remove it entirely
            // pathTransition: 'none',

            // Colors
            pathColor: "var(--btn-hover-color)",
            textColor: "var(--text-primary)",
            trailColor: "var(--text-primary)000",
            backgroundColor: "#ffffff",
          })}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
