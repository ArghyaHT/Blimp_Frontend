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
  symbol = "₹",
  height = "auto",
}) => {
  const formatNumber = (num) => {
    if (num == null || isNaN(num)) return "0";
    const numericVal = Number(num);

    if (numericVal >= 1_000_000_000)
      return (numericVal / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
    if (numericVal >= 1_000_000)
      return (numericVal / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (numericVal >= 1_000)
      return (numericVal / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return numericVal.toLocaleString();
  };

  const calculatedPercentage =
    percentageAchieved !== undefined && percentageAchieved !== null
      ? Math.round(Number(percentageAchieved))
      : targetAmount && Number(targetAmount) > 0
      ? Math.min(100, Math.round((Number(raisedAmount || 0) / Number(targetAmount)) * 100))
      : 0;

  const displayCurrency = currency ? currency.toUpperCase() : "";

  return (
    <div className={styles.progressContainer} style={{ height }}>
      <div className={styles.circularWrapper}>
        <CircularProgressbar
          value={calculatedPercentage}
          text={`${calculatedPercentage}%`}
          styles={buildStyles({
            rotation: 0,
            strokeLinecap: "round",
            textSize: "24px",
            pathTransitionDuration: 0.5,
            pathColor: "var(--btn-hover-color, #00c1e8)",
            textColor: "var(--text-primary, #111827)",
            trailColor: "#e5e7eb",
            backgroundColor: "#ffffff",
          })}
        />
      </div>

      <div className={styles.textWrapper}>
        <p className={styles.raisedText}>
          {symbol}
          {formatNumber(raisedAmount)} {displayCurrency}{" "}
          <span className={styles.raisedLabel}>raised</span>
        </p>

        {targetAmount != null && (
          <p className={styles.targetText}>
            of {symbol}
            {formatNumber(targetAmount)}
          </p>
        )}

        {donationCount != null && (
          <p className={styles.donationsText}>
            {formatNumber(donationCount)} donations
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
