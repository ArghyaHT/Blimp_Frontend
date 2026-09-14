import React from "react";
import style from "./FeatureCardMobile.module.css";
import { useNavigate } from "react-router-dom";
import { PlaceIcon, RightIcon } from "../../icons";
import ProgressBar from "../ProgressBar/ProgressBar";

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
      <img src={featureItem?.banner_image} alt="" />
      <div>
        <h2>{featureItem?.campaign_name}</h2>
        <div>
          <PlaceIcon />
          <p>{featureItem?.country?.name}</p>
        </div>

        {/* <ProgressBar
          raisedAmount={featureItem?.raisedAmount}
          targetAmount={featureItem?.targetAmount}
          percentageAchieved={featureItem?.percentageAchieved}
          donationCount={featureItem?.donationInfo?.length}
          currency={featureItem?.country?.currency}
          symbol={featureItem?.country?.symbol}
          height={"6rem"}
        /> */}
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
          <span>View More</span>
          <div>
            <RightIcon />
          </div>
        </button>
      </div>
    </div>
  );
};

export default FeatureCardMobile;
