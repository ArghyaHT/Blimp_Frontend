import React from "react";
import style from "./FeatureCard.module.css";
import { useNavigate } from "react-router-dom";
import { PlaceIcon } from "../../icons";
import ProgressBar from "../ProgressBar/ProgressBar";
import { isVerifiedCampaign } from "../../utils/campaignUtils";
import campaignDummy from "../../assets/campaign_dummy.jpeg";
import { getPublisher } from "../../utils/publisher";

const FeatureCard = ({ featureItem }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/campaign/${featureItem?.slug || featureItem?.id}`, {
          state: featureItem,
        });
      }}
      className={style.featureCard}
    >
      <div className={style.imageWrapper}>
        <img src={featureItem?.banner_image || campaignDummy} alt="" />
        {isVerifiedCampaign(featureItem) && (
          <span className={style.featureVerifiedBadge}>
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
        )}
      </div>
      <div>
        <h2>{featureItem?.campaign_name}</h2>
        {getPublisher(featureItem) && (
          <p className={style.publishedBy} onClick={(e) => e.stopPropagation()}>
            Created by: <strong>{getPublisher(featureItem).name}</strong>
          </p>
        )}
        <div
          className={featureItem?.country?.name ? style.countryLink : undefined}
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
          <p>{featureItem?.country?.name}</p>
        </div>

        <ProgressBar
          raisedAmount={featureItem?.raisedAmount}
          targetAmount={featureItem?.targetAmount}
          percentageAchieved={featureItem?.percentageAchieved}
          donationCount={featureItem?.donationInfo?.length}
          currency={featureItem?.country?.currency}
          symbol={featureItem?.country?.symbol}
        />

        <button className="btn-3d btn-3d--secondary">
          <span>Support</span>
        </button>
      </div>
    </div>
  );
};

export default FeatureCard;
