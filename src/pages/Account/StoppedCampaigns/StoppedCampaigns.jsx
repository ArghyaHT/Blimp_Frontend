import React, { useEffect, useState } from "react";
import styles from "./StoppedCampaigns.module.css";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { Skeleton } from "@mui/material";

const StoppedCampaigns = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const [stoppedCampaigns, setStoppedCampaigns] = useState({
    loading: false,
    error: null,
    data: [],
  });

  useEffect(() => {
    if (userId) {
      const fetchStoppedCampaigns = async () => {
        setStoppedCampaigns((prev) => ({ ...prev, loading: true, error: null }));
        try {
          // Attempt dedicated endpoint or general campaigns endpoint with fallback
          const { data } = await api.post("/get-stopped-campaigns", { userId });
          if (data?.code === 200) {
            const rawCampaigns =
              data?.data?.stoppedCampaigns || data?.data?.campaigns || (Array.isArray(data?.data) ? data?.data : []);

            setStoppedCampaigns({
              loading: false,
              error: null,
              data: rawCampaigns,
            });
          } else {
            setStoppedCampaigns({
              loading: false,
              error: data?.message || "Failed to fetch stopped campaigns",
              data: [],
            });
          }
        } catch (error) {
          setStoppedCampaigns({
            loading: false,
            error: error.message,
            data: [],
          });
        }
      };

      fetchStoppedCampaigns();
    }
  }, [userId]);

  return stoppedCampaigns?.loading ? (
    <>
      {[0, 1].map((item) => (
        <Skeleton
          key={item}
          variant="rectangular"
          height={"25rem"}
          sx={{
            width: "100%",
            marginBottom: "2rem",
            borderRadius: "1rem",
          }}
        />
      ))}
    </>
  ) : stoppedCampaigns?.data?.length > 0 ? (
    <>
      {stoppedCampaigns.data.map((item) => {
        return (
          <div className={styles.campaignCard} key={item.id}>
            <div>
              <h2>{item?.campaign_name}</h2>
              <p>stopped</p>
            </div>
            <div className={styles.donationContainer}>
              <p>
                Published by: <b>{item?.name || item?.campaigns?.fullname}</b>
              </p>

              <ProgressBar
                raisedAmount={item?.raisedAmount || 0}
                targetAmount={item?.target_amount || item?.targetAmount || 0}
                percentageAchieved={item?.percentageAchieved || 0}
                donationCount={item?.donationInfo?.length || 0}
                currency={item?.country?.currency || ""}
                symbol={item?.country?.symbol || ""}
              />
            </div>

            <div className={styles.actionContainer}>
              <button
                className={styles.viewBtn}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate("/cause", {
                    state: item,
                  });
                }}
              >
                View Campaign
              </button>

              <button
                className={styles.relaunchBtn}
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate("/edit-campaign", {
                    state: { edit_campaign_item: item, isRelaunch: true },
                  });
                }}
              >
                Relaunch Campaign
              </button>
            </div>
          </div>
        );
      })}
    </>
  ) : (
    <div className={styles.noStoppedCampaigns}>
      <div>
        <h1>No Stopped Campaigns</h1>
        <p>You don't have any stopped or ended campaigns at the moment.</p>
      </div>
    </div>
  );
};

export default StoppedCampaigns;
