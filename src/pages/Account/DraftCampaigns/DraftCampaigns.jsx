import React, { useEffect, useState } from "react";
import styles from "./DraftCampaigns.module.css";
import ProgressBar from "../../../components/ProgressBar/ProgressBar";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import { toastStyle } from "../../../utils/toastStyles";

const DraftCampaigns = () => {

  const {
    userId
  } = useAuth()

  const navigate = useNavigate()

  const [draftCampaigns, setDraftCampaigns] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (userId) {
      const fetchDraftCampaigns = async () => {
        setDraftCampaigns((prev) => ({ ...prev, loading: true, error: null }));
        try {
          const { data } = await api.post("/get-draft-campaigns", {
            userId: userId
          });

          if (data.code === 200) {
            setDraftCampaigns({ loading: false, error: null, data });
          } else {
            setDraftCampaigns({ loading: false, error: data.message, data: {} });
          }
        } catch (error) {
          setDraftCampaigns({ loading: false, error: error.message, data: {} });
        }
      }

      fetchDraftCampaigns()
    }

  }, [userId])

  const handleDeleteDraft = async (campaignId) => {
    if (!window.confirm("Are you sure you want to delete this draft campaign?")) {
      return;
    }

    setDeletingId(campaignId);
    try {
      const { data } = await api.post("/delete-campaign", {
        campaign_id: campaignId,
        user_id: userId,
      });

      if (data.code === 200) {
        toast.success("Draft campaign deleted successfully", {
          duration: 3000,
          style: toastStyle,
        });

        setDraftCampaigns((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            data: (prev.data?.data || []).filter((c) => c.id !== campaignId),
          },
        }));
      } else {
        toast.error(data.message || "Failed to delete draft campaign", {
          duration: 3000,
          style: toastStyle,
        });
      }
    } catch (err) {
      toast.error("Failed to delete draft campaign", {
        duration: 3000,
        style: toastStyle,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    draftCampaigns?.loading ? (
      <>
        {
          [0, 1, 2].map((item) => {
            return (
              <Skeleton
                key={item}
                variant="rectangular"
                height={"25rem"}
                sx={{
                  width: {
                    xs: "100%", // mobile
                    sm: "100%", // tablet
                    md: "100%",  // desktop
                  },
                  marginBottom: "2rem"
                }}
              />
            )
          })
        }
      </>
    ) : draftCampaigns?.data?.data?.length > 0 ? (
      <>
        {draftCampaigns?.data?.data?.map((item) => {
          return (
            <div className={styles.campaignCard} key={item.id}>
              <h2>{item?.campaign_name}</h2>

              <div className={styles.donationContainer}>
                <p>
                  Published by: <b>{item?.name}</b>
                </p>

                <ProgressBar
                  raisedAmount={item?.raisedAmount || 0}
                  targetAmount={item?.target_amount || 0}
                  percentageAchieved={item?.percentageAchieved || 0}
                  donationCount={item?.donationInfo?.length || 0}
                  currency={item?.country?.currency || ""}
                  symbol={item?.country?.symbol || ""}
                />
              </div>

              <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                <button
                  onClick={() =>
                    navigate("/edit-campaign", {
                      state: { edit_campaign_item: item },
                    })
                  }
                >
                  edit draft
                </button>

                <button
                  onClick={() => handleDeleteDraft(item.id)}
                  disabled={deletingId === item.id}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "2.5rem",
                    padding: "0.8rem 1.8rem",
                    fontSize: "1.4rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    opacity: deletingId === item.id ? 0.7 : 1,
                  }}
                >
                  {deletingId === item.id ? "deleting..." : "delete draft"}
                </button>
              </div>
            </div>
          );
        })}
      </>
    ) : (
      <div
        className={styles.noDraftCampaigns}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%"
        }}>
        <div>
          <h1>No Draft Campaigns</h1>
          <button
            onClick={() => {
              navigate("/start-campaign")
            }}>Start a campaign</button>
        </div>
      </div >
    )
  );
};

export default DraftCampaigns;
