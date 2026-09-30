import React from "react";
import styles from "./CampaignCard.module.css";
import { RightIcon } from "../../icons";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "../VerifiedBadge/VerifiedBadge";
import { isVerifiedCampaign } from "../../utils/campaignUtils";
import campaignDummy from "../../assets/campaign_dummy.jpeg";

const CampaignCard = ({ bannerImage, description, campaignName, campaignItem }) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.campaignCardContainer}
      onClick={() => {
        window.scrollTo(0, 0);
        navigate("/feature-detail", {
          state: campaignItem
        });
      }}
    >
      <div className={styles.imageWrapper}>
        <img src={bannerImage || campaignDummy} alt="" />
        {isVerifiedCampaign(campaignItem) && <VerifiedBadge />}
      </div>
      <h2>{campaignName}</h2>
      <button>
        <span>View More</span>
        <RightIcon />
      </button>
    </div>
  );
};

export default CampaignCard;
