import React, { useState, useEffect, useRef } from "react";
import style from "./FeatureCardMobile.module.css";
import { useNavigate } from "react-router-dom";
import { PlaceIcon } from "../../icons";
import { isVerifiedCampaign } from "../../utils/campaignUtils";
import campaignDummy from "../../assets/campaign_dummy.jpeg";
import { getPublisher } from "../../utils/publisher";

const FeatureCardMobile = ({ featureItem }) => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animProgress, setAnimProgress] = useState(0);

  const formatNumber = (num, isExact = false) => {
    if (num == null || num === "") return "0";
    const cleanStr = String(num).replace(/[^0-9.]/g, "");
    if (!cleanStr) return "0";
    const numericVal = Number(cleanStr);
    if (isNaN(numericVal)) return "0";

    const curr = featureItem?.country?.currency;
    const sym = featureItem?.country?.symbol;
    const isINR =
      (curr && String(curr).toUpperCase() === "INR") ||
      sym === "₹" ||
      sym === "Rs" ||
      sym === "Rs.";

    return numericVal.toLocaleString(isINR ? "en-IN" : "en-US", {
      maximumFractionDigits: isExact ? 2 : 0,
    });
  };

  const mobileTarget = Number(
    (typeof featureItem?.targetAmount === "string"
      ? featureItem.targetAmount.replace(/[^0-9.]/g, "")
      : featureItem?.targetAmount ?? featureItem?.target_amount) || 0
  );
  const mobileRaised = Number(
    (typeof featureItem?.raisedAmount === "string"
      ? featureItem.raisedAmount.replace(/[^0-9.]/g, "")
      : featureItem?.raisedAmount ?? featureItem?.raised_amount) || 0
  );
  const dynamicPercentage =
    mobileTarget > 0
      ? Math.round((mobileRaised / mobileTarget) * 100)
      : Math.round(Number(featureItem?.percentageAchieved || 0));

  // Trigger when card enters viewport
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

  // Smooth animation from 0 to price & percentage
  useEffect(() => {
    if (!isVisible) return;

    let animId;
    const duration = 1200;
    const startTime = performance.now();
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
  }, [isVisible, mobileRaised, dynamicPercentage]);

  const displayPercentage = Math.round(dynamicPercentage * animProgress);
  const displayRaised =
    animProgress >= 1
      ? featureItem?.raisedAmount
      : Math.round(mobileRaised * animProgress);
  const renderCampaignTitle = () => {
    const title = featureItem?.campaign_name || "";
    const isVerified = isVerifiedCampaign(featureItem);
    if (!isVerified || !title) {
      return title;
    }
    const words = title.trim().split(" ");
    if (words.length <= 1) {
      return (
        <span className={style.titleWrap}>
          {title}
          <span
            className={style.verifiedTick}
            title="Verified Campaign"
            aria-label="Verified"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="9" fill="#10b981" />
              <path
                d="M6 10.2L8.6 12.8L14 7.4"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      );
    }
    const lastWord = words.pop();
    const rest = words.join(" ");
    return (
      <>
        {rest}{" "}
        <span className={style.titleWrap}>
          {lastWord}
          <span
            className={style.verifiedTick}
            title="Verified Campaign"
            aria-label="Verified"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="10" cy="10" r="9" fill="#10b981" />
              <path
                d="M6 10.2L8.6 12.8L14 7.4"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/campaign/${featureItem?.slug || featureItem?.id}`, {
          state: featureItem,
        });
      }}
      className={style.featureCardMobile}
    >
      <div className={style.imageWrapper}>
        <img src={featureItem?.banner_image || campaignDummy} alt="" />
      </div>
      <div className={style.detailsWrapper}>
        <div className={style.headerSection}>
          <h2>{renderCampaignTitle()}</h2>
          {getPublisher(featureItem) && (
            <p
              onClick={(e) => e.stopPropagation()}
              style={{ fontSize: "1.2rem", color: "#64748b", margin: "0.2rem 0", cursor: "default", width: "fit-content" }}
            >
              Created by <strong style={{ color: "#334155" }}>{getPublisher(featureItem).name}</strong>
            </p>
          )}
          <div
            className={style.location}
            style={featureItem?.country?.name ? { cursor: "pointer" } : undefined}
            onClick={(e) => {
              if (!featureItem?.country?.name) return;
              e.stopPropagation();
              window.scrollTo(0, 0);
              const countrySlug = featureItem.country.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              navigate(`/country/${countrySlug}`, {
                state: { country: featureItem.country },
              });
            }}
          >
            <PlaceIcon />
            <p style={featureItem?.country?.name ? { textDecoration: "underline" } : undefined}>
              {featureItem?.country?.name}
            </p>
          </div>
        </div>

        <div className={style.progressSection}>
          <div className={style.ProgressBar}>
            <div
              style={{
                width: `${Math.min(100, Math.max(0, displayPercentage))}%`,
              }}
            ></div>
          </div>

          <div className={style.ProgressBarText}>
            <p>
              {featureItem?.country?.symbol || (featureItem?.country?.currency ? "" : "₹")}
              {formatNumber(displayRaised, animProgress >= 1)}
              {!featureItem?.country?.symbol && featureItem?.country?.currency ? ` ${featureItem.country.currency}` : ""} raised
            </p>
            <p>
              {featureItem?.country?.symbol || "₹"}
              {formatNumber(featureItem?.targetAmount, true)} goal -{" "}
              {Number(featureItem?.donationInfo?.length || 0).toLocaleString()} donations
            </p>
          </div>
        </div>

        <button className={`${style.supportButton} btn-3d btn-3d--secondary`}>
          <span>Support</span>
        </button>
      </div>
    </div>
  );
};

export default FeatureCardMobile;
