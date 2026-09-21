import React, { useEffect, useState } from "react";
import styles from "./CampaignUpdates.module.css";
import api from "../../../api/api";
import { useAuth } from "../../../context/AuthContext";
import { Skeleton } from "@mui/material";
import toast from "react-hot-toast";
import { toastStyle } from "../../../utils/toastStyles";
import moment from "moment";

const CampaignUpdates = () => {
  const { userId, user } = useAuth();
  const [campaigns, setCampaigns] = useState({ loading: false, data: [] });
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [updates, setUpdates] = useState({ loading: false, data: [] });

  // Form states
  const [title, setTitle] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]); // [{ file, preview, type: 'image' | 'video' }]
  const [submitting, setSubmitting] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null); // when editing

  // Fetch campaigns owned by user
  useEffect(() => {
    if (userId) {
      const fetchCampaigns = async () => {
        setCampaigns((prev) => ({ ...prev, loading: true }));
        try {
          const { data } = await api.post("/get-campaigns", { userId });
          if (data.code === 200 && data.data?.campaigns) {
            setCampaigns({ loading: false, data: data.data.campaigns });
            if (data.data.campaigns.length > 0) {
              setSelectedCampaignId(data.data.campaigns[0].id);
            }
          } else {
            setCampaigns({ loading: false, data: [] });
          }
        } catch (err) {
          console.error("Error loading user campaigns:", err);
          setCampaigns({ loading: false, data: [] });
        }
      };
      fetchCampaigns();
    }
  }, [userId]);

  // Fetch updates when selected campaign changes
  const fetchUpdates = async (campaignId) => {
    if (!campaignId) return;
    setUpdates((prev) => ({ ...prev, loading: true }));
    try {
      const { data } = await api.post("/get-campaign-updates", { campaign_id: campaignId });
      if (data.code === 200) {
        setUpdates({ loading: false, data: data.data || [] });
      } else {
        setUpdates({ loading: false, data: [] });
      }
    } catch (err) {
      console.error("Error loading campaign updates:", err);
      setUpdates({ loading: false, data: [] });
    }
  };

  useEffect(() => {
    if (selectedCampaignId) {
      fetchUpdates(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  // Handle media file selection
  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newMedia = [];
    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");

      if (!isImage && !isVideo) {
        toast.error(`"${file.name}" is not a supported image or video file.`, { style: toastStyle });
        return;
      }

      const preview = URL.createObjectURL(file);
      newMedia.push({
        file,
        preview,
        type: isVideo ? "video" : "image",
      });
    });

    setSelectedMedia((prev) => [...prev, ...newMedia]);
    e.target.value = "";
  };

  const removeMedia = (index) => {
    setSelectedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setTitle("");
    setUpdateText("");
    setSelectedMedia([]);
    setEditingUpdate(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCampaignId) {
      return toast.error("Please select a campaign.", { style: toastStyle });
    }

    if (!title.trim()) {
      return toast.error("Update title is required.", { style: toastStyle });
    }

    if (!updateText.trim()) {
      return toast.error("Update content text is required.", { style: toastStyle });
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("campaign_id", selectedCampaignId);
      formData.append("title", title);
      formData.append("update_text", updateText);

      if (editingUpdate) {
        formData.append("update_id", editingUpdate.id);
        // keep existing media if any
        if (editingUpdate.media) {
          formData.append("existing_media", JSON.stringify(editingUpdate.media));
        }
      }

      // Append files
      selectedMedia.forEach((item) => {
        if (item.file) {
          formData.append("media", item.file);
        }
      });

      const endpoint = editingUpdate ? "/update-campaign-update" : "/add-campaign-update";
      const { data } = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.code === 200) {
        toast.success(editingUpdate ? "Update edited successfully!" : "Update published successfully!", {
          style: toastStyle,
        });
        resetForm();
        fetchUpdates(selectedCampaignId);
      } else {
        toast.error(data.message || "Failed to save update.", { style: toastStyle });
      }
    } catch (err) {
      console.error("Submit update error:", err);
      toast.error(err.message || "An error occurred while saving.", { style: toastStyle });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item) => {
    setEditingUpdate(item);
    setTitle(item.title);
    setUpdateText(item.update_text);
    setSelectedMedia([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = async (updateId) => {
    if (!window.confirm("Are you sure you want to delete this update?")) return;

    try {
      const { data } = await api.post("/delete-campaign-update", {
        user_id: userId,
        update_id: updateId,
      });

      if (data.code === 200) {
        toast.success("Update deleted.", { style: toastStyle });
        fetchUpdates(selectedCampaignId);
      } else {
        toast.error(data.message || "Failed to delete update.", { style: toastStyle });
      }
    } catch (err) {
      toast.error(err.message || "Error deleting update.", { style: toastStyle });
    }
  };

  return (
    <div className={styles.campaignUpdatesContainer}>
      <h2>Post & Manage Campaign Updates</h2>
      <p className={styles.subHeading}>
        Keep your supporters informed with regular stories, progress milestones, photos, and videos.
      </p>

      {campaigns.loading ? (
        <Skeleton variant="rectangular" height="4rem" style={{ borderRadius: "8px", marginBottom: "2rem" }} />
      ) : campaigns.data.length === 0 ? (
        <div className={styles.noCampaignsBox}>
          <p>You have no active campaigns to post updates for.</p>
        </div>
      ) : (
        <>
          {/* Campaign Selector */}
          <div className={styles.campaignSelectWrapper}>
            <label htmlFor="campaignSelect">Select Campaign:</label>
            <select
              id="campaignSelect"
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
            >
              {campaigns.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.campaign_name}
                </option>
              ))}
            </select>
          </div>

          {/* Create / Edit Form */}
          <form className={styles.updateForm} onSubmit={handleFormSubmit}>
            <h3>{editingUpdate ? "Edit Campaign Update" : "Publish a New Update"}</h3>

            <div className={styles.formGroup}>
              <label>Update Headline / Title</label>
              <input
                type="text"
                placeholder="e.g. Milestone Achieved: Clean water pipes delivered!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Update Story Content</label>
              <textarea
                rows={6}
                placeholder="Describe what's new, progress details, or stories for your donors..."
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
              />
            </div>

            {/* Media Upload */}
            <div className={styles.formGroup}>
              <label>Attach Images / Videos (Optional)</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaSelect}
                id="update-media-input"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className={styles.uploadBtn}
                onClick={() => document.getElementById("update-media-input").click()}
              >
                + Upload Images or Videos
              </button>

              {/* Existing Media preview if editing */}
              {editingUpdate?.media?.length > 0 && (
                <div className={styles.existingMediaSection}>
                  <p>Existing Uploaded Media:</p>
                  <div className={styles.mediaGrid}>
                    {editingUpdate.media.map((item, idx) => (
                      <div key={idx} className={styles.mediaPreviewItem}>
                        {item.type === "video" ? (
                          <video src={item.url} controls width="120" />
                        ) : (
                          <img src={item.url} alt="" width="120" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly selected media previews */}
              {selectedMedia.length > 0 && (
                <div className={styles.mediaGrid}>
                  {selectedMedia.map((item, idx) => (
                    <div key={idx} className={styles.mediaPreviewItem}>
                      {item.type === "video" ? (
                        <video src={item.preview} controls width="120" />
                      ) : (
                        <img src={item.preview} alt="" width="120" />
                      )}
                      <button
                        type="button"
                        className={styles.removeMediaBtn}
                        onClick={() => removeMedia(idx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <button type="submit" disabled={submitting} className={styles.submitBtn}>
                {submitting ? "Saving..." : editingUpdate ? "Update Story" : "Publish Update"}
              </button>
              {editingUpdate && (
                <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Past Published Updates */}
          <div className={styles.updatesHistoryList}>
            <h3>Published Updates History</h3>
            {updates.loading ? (
              <Skeleton variant="rectangular" height="15rem" style={{ borderRadius: "8px" }} />
            ) : updates.data.length === 0 ? (
              <p className={styles.emptyText}>No updates posted yet for this campaign.</p>
            ) : (
              updates.data.map((item) => (
                <div key={item.id} className={styles.updateCard}>
                  <div className={styles.updateCardHeader}>
                    <div>
                      <h4>{item.title}</h4>
                      <span className={styles.updateDate}>{moment(item.createdAt).format("MMM DD, YYYY · h:mm A")}</span>
                    </div>
                    <div className={styles.cardActions}>
                      <button onClick={() => handleEditClick(item)}>Edit</button>
                      <button onClick={() => handleDeleteClick(item.id)} className={styles.deleteBtn}>
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className={styles.updateBody}>{item.update_text}</p>

                  {item.media && item.media.length > 0 && (
                    <div className={styles.updateMediaDisplay}>
                      {item.media.map((m, idx) => (
                        <div key={idx} className={styles.updateMediaItem}>
                          {m.type === "video" ? (
                            <video src={m.url} controls className={styles.updateVideo} />
                          ) : (
                            <img src={m.url} alt="" className={styles.updateImg} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignUpdates;
