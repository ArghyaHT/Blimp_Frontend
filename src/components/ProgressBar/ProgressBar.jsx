import React, { useState, useEffect, useRef } from "react";
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
  theme = "light",
  compact = false,
  className = "",
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const cleanRaised = Number(
    (typeof raisedAmount === "string"
      ? raisedAmount.replace(/[^0-9.]/g, "")
      : raisedAmount) || 0
  );
  const cleanTarget = Number(
    (typeof targetAmount === "string"
      ? targetAmount.replace(/[^0-9.]/g, "")
      : targetAmount) || 0
  );

  // Dynamic percentage calculated everywhere
  const calculatedPercentage =
    cleanTarget > 0
      ? Math.round((cleanRaised / cleanTarget) * 100)
      : percentageAchieved !== undefined &&
        percentageAchieved !== null &&
        !isNaN(percentageAchieved)
      ? Math.round(Number(percentageAchieved))
      : 0;

  const hasSymbol = Boolean(symbol && symbol.trim());
  const displayCurrency = !hasSymbol && currency ? currency.toUpperCase() : "";

  // Trigger when element enters viewport (or on mount if already visible)
  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Smooth count-up animation from 0 to price & percentage
  useEffect(() => {
    if (!isVisible) return;

    let animId;
    const duration = 1200; // 1.2s smooth animation
    const startTime = performance.now();

    // Cubic ease-out curve: starts quickly and smoothly decelerates
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      setAnimProgress(eased);

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      } else {
        setAnimProgress(1);
      }
    };

    animId = requestAnimationFrame(step);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isVisible, cleanRaised, calculatedPercentage]);

  const formatNumber = (num, isExact = false) => {
    if (num == null || num === "") return "0";
    const cleanStr = String(num).replace(/[^0-9.]/g, "");
    if (!cleanStr) return "0";
    const numericVal = Number(cleanStr);
    if (isNaN(numericVal)) return "0";

    const isINR =
      (currency && String(currency).toUpperCase() === "INR") ||
      symbol === "₹" ||
      symbol === "Rs" ||
      symbol === "Rs.";

    return numericVal.toLocaleString(isINR ? "en-IN" : "en-US", {
      maximumFractionDigits: isExact ? 2 : 0,
    });
  };

  const displayPercentage = Math.round(calculatedPercentage * animProgress);
  const displayRaised =
    animProgress >= 1
      ? raisedAmount
      : Math.round(cleanRaised * animProgress);

  const isDark = theme === "dark";

  return (
    <div
      ref={containerRef}
      className={`${styles.progressContainer} ${isDark ? styles.darkProgress : ""} ${
        compact ? styles.compact : ""
      } ${className}`.trim()}
      style={{ height }}
    >
      <div className={styles.circularWrapper}>
        <CircularProgressbar
          value={Math.min(100, Math.max(0, displayPercentage))}
          text={`${displayPercentage}%`}
          styles={buildStyles({
            rotation: 0,
            strokeLinecap: "round",
            textSize: compact ? "26px" : "24px",
            pathTransitionDuration: 0.05,
            pathColor: "var(--btn-hover-color, #00c1e8)",
            textColor: isDark ? "#ffffff" : "var(--text-primary, #111827)",
            trailColor: isDark ? "rgba(255, 255, 255, 0.2)" : "#e5e7eb",
            backgroundColor: isDark ? "transparent" : "#ffffff",
          })}
        />
      </div>

      <div className={styles.textWrapper}>
        <p
          className={`${styles.raisedText} ${
            isDark ? styles.darkRaisedText : ""
          }`}
        >
          {symbol}
          {formatNumber(displayRaised, animProgress >= 1)}
          {displayCurrency ? ` ${displayCurrency}` : ""}{" "}
          <span
            className={`${styles.raisedLabel} ${
              isDark ? styles.darkRaisedLabel : ""
            }`}
          >
            raised
          </span>
        </p>

        {cleanTarget > 0 && (
          <p
            className={`${styles.targetText} ${
              isDark ? styles.darkTargetText : ""
            }`}
          >
            of {symbol}
            {formatNumber(targetAmount, true)}
          </p>
        )}

        {donationCount != null && (
          <p
            className={`${styles.donationsText} ${
              isDark ? styles.darkDonationsText : ""
            }`}
          >
            {formatNumber(donationCount, true)} donations
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
