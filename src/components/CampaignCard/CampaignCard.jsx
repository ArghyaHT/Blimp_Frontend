import React from "react";
import styles from "./CampaignCard.module.css";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import { isVerifiedCampaign } from "../../utils/campaignUtils";
import campaignDummy from "../../assets/campaign_dummy.jpeg";

import ProgressBar from "../ProgressBar/ProgressBar";

const CampaignCard = ({ bannerImage, description, campaignName, campaignItem }) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.campaignCardContainer}
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/campaign/${campaignItem?.slug || campaignItem?.id}`, {
          state: campaignItem
        });
      }}
    >
      <div className={styles.imageWrapper}>
        <img src={bannerImage || campaignDummy} alt="" />
        {isVerifiedCampaign(campaignItem) && <VerifiedBadge />}
      </div>
      <h2>{campaignName}</h2>
      <div className={styles.actionRow}>
        <button>
          <span>Support</span>
        </button>
        <div className={styles.mobileProgressWrapper}>
          <ProgressBar
            raisedAmount={campaignItem?.raisedAmount ?? campaignItem?.raised_amount}
            targetAmount={campaignItem?.targetAmount ?? campaignItem?.target_amount}
            percentageAchieved={campaignItem?.percentageAchieved}
            donationCount={campaignItem?.donationInfo?.length}
            currency={campaignItem?.country?.currency}
            symbol={campaignItem?.country?.symbol}
            theme="dark"
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
