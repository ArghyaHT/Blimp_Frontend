import React from "react";
import style from "./FeatureCardMobile.module.css";
import { useNavigate } from "react-router-dom";
import { PlaceIcon, RightIcon } from "../../icons";
import ProgressBar from "../ProgressBar/ProgressBar";
import { isVerifiedCampaign } from "../../utils/campaignUtils";
import campaignDummy from "../../assets/campaign_dummy.jpeg";

const FeatureCardMobile = ({ featureItem }) => {
  const navigate = useNavigate();

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
      onClick={() => {
        window.scrollTo(0, 0);
        navigate("/feature-detail", {
          state: featureItem,
        });
      }}
      className={style.featureCardMobile}
    >
      <div className={style.imageWrapper}>
        <img src={featureItem?.banner_image || campaignDummy} alt="" />
        {isVerifiedCampaign(featureItem) && (
          <span className={style.featureVerifiedBadge}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Verified</span>
          </span>
        )}
      </div>
      <div>
        <h2>{featureItem?.campaign_name}</h2>
        <div>
          <PlaceIcon />
          <p>{featureItem?.country?.name}</p>
        </div>

        <div className={style.ProgressBar}>
          <div
            style={{
              width: `${featureItem?.percentageAchieved}%`,
            }}
          ></div>
        </div>

        <div className={style.ProgressBarText}>
          <p>
            {featureItem?.country?.symbol}{" "}
            {formatNumber(featureItem?.raisedAmount)}{" "}
            {featureItem?.country?.currency} raised
          </p>
          <p>
            {featureItem?.country?.symbol}
            {formatNumber(featureItem?.targetAmount)} goal -{" "}
            {formatNumber(featureItem?.donationInfo?.length)} donations
          </p>
        </div>

        <button>
          <span>Support</span>
          <div>
            <RightIcon />
          </div>
        </button>
      </div>
    </div>
  );
};

export default FeatureCardMobile;
