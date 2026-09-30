import React, { useState, useEffect } from "react";
import style from "./ManageSubscription.module.css";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { SearchIcon } from "../../icons";
import VerifiedBadge from "../../components/VerifiedBadge/VerifiedBadge";
import { isVerifiedCampaign } from "../../utils/campaignUtils";

const ManageSubscription = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadingAction, setLoadingAction] = useState({ id: null, action: null });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user?.email) {
      setEmail(user.email);
      handleSearch(user.email);
    }
  }, [user]);

  const handleSearch = async (targetEmail = email) => {
    const searchEmail = (targetEmail || "").trim();
    if (!searchEmail) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(searchEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.post("/get-user-subscriptions", {
        email: searchEmail,
      });

      const resData = response.data;
      if (resData?.code === 200 && Array.isArray(resData?.data)) {
        setSubscriptions(resData.data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Fetch Subscriptions Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch subscriptions"
      );
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async (sub) => {
    const subId = sub.razorpay_subscription_id;
    if (!subId && !sub.id) return;

    if (!window.confirm("Are you sure you want to pause this monthly subscription?")) {
      return;
    }

    setLoadingAction({ id: sub.id, action: "pause" });
    try {
      const response = await api.post("/pause-subscription", {
        razorpay_subscription_id: subId,
        donation_id: sub.id,
      });

      const resData = response.data;
      if (resData?.code === 200) {
        toast.success("Subscription paused successfully");
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id ? { ...item, subscription_status: "paused" } : item
          )
        );
      } else {
        toast.error(resData?.message || "Failed to pause subscription");
      }
    } catch (error) {
      console.error("Pause Subscription Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to pause subscription"
      );
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const handleResume = async (sub) => {
    const subId = sub.razorpay_subscription_id;
    if (!subId && !sub.id) return;

    setLoadingAction({ id: sub.id, action: "resume" });
    try {
      const response = await api.post("/resume-subscription", {
        razorpay_subscription_id: subId,
        donation_id: sub.id,
      });

      const resData = response.data;
      if (resData?.code === 200) {
        toast.success("Subscription resumed successfully");
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id ? { ...item, subscription_status: "active" } : item
          )
        );
      } else {
        toast.error(resData?.message || "Failed to resume subscription");
      }
    } catch (error) {
      console.error("Resume Subscription Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to resume subscription"
      );
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const handleCancel = async (sub) => {
    const subId = sub.razorpay_subscription_id;
    if (!subId && !sub.id) return;

    if (
      !window.confirm(
        "Are you sure you want to cancel this recurring monthly donation? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoadingAction({ id: sub.id, action: "cancel" });
    try {
      const response = await api.post("/cancel-subscription", {
        razorpay_subscription_id: subId,
        donation_id: sub.id,
        cancel_immediately: true,
      });

      const resData = response.data;
      if (resData?.code === 200) {
        toast.success("Subscription cancelled successfully");
        setSubscriptions((prev) =>
          prev.map((item) =>
            item.id === sub.id
              ? { ...item, subscription_status: "cancelled" }
              : item
          )
        );
      } else {
        toast.error(resData?.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Cancel Subscription Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return style.badgeActive;
      case "paused":
        return style.badgePaused;
      case "cancelled":
        return style.badgeCancelled;
      default:
        return style.badgeCreated;
    }
  };

  return (
    <main style={{ backgroundColor: "#fafafa", minHeight: "90vh" }}>
      <div className={style.container}>
        <div className={style.heroSection}>
          <h1 className={style.heroTitle}>Manage Your Subscriptions</h1>
          <p className={style.heroSubtitle}>
            Search by your email address to manage your recurring monthly donations, pause, resume, or cancel subscription plans.
          </p>
        </div>

        <div className={style.searchCard}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <label className={style.searchLabel}>Email Address</label>
            <div className={style.searchGroup}>
              <input
                type="email"
                className={style.searchInput}
                placeholder="Enter your email (e.g. john@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className={style.searchButton}
                disabled={loading}
              >
                <SearchIcon size="1.8rem" color="#ffffff" />
                <span>{loading ? "Searching..." : "Search"}</span>
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className={style.loadingSpinner}>
            <p>Loading subscriptions...</p>
          </div>
        ) : searched ? (
          <div>
            <div className={style.resultsHeader}>
              <h2 className={style.resultsCount}>
                Subscriptions ({subscriptions.length})
              </h2>
            </div>

            {subscriptions.length === 0 ? (
              <div className={style.emptyState}>
                <h3 className={style.emptyTitle}>No Subscriptions Found</h3>
                <p className={style.emptySubtitle}>
                  We couldn't find any recurring monthly donations associated with{" "}
                  <strong>{email}</strong>.
                </p>
              </div>
            ) : (
              <div className={style.subscriptionList}>
                {subscriptions.map((sub) => {
                  const title =
                    sub.campaignInfo?.campaign_name ||
                    sub.articleInfo?.title ||
                    "Monthly Donation Support";
                  const image =
                    sub.campaignInfo?.banner_image ||
                    sub.articleInfo?.banner_image ||
                    "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=500&auto=format&fit=crop";

                  const currencySymbol = sub.donation_currency === "USD" ? "$" : "₹";
                  const status = sub.subscription_status || "created";

                  return (
                    <div key={sub.id} className={style.subscriptionCard}>
                      <div className={style.itemImageWrapper}>
                        <img
                          src={image}
                          alt={title}
                          className={style.itemImage}
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?w=500&auto=format&fit=crop";
                          }}
                        />
                        {isVerifiedCampaign(sub.campaignInfo) && <VerifiedBadge />}
                      </div>

                      <div className={style.itemInfo}>
                        <div className={style.titleBadgeRow}>
                          <h3 className={style.itemTitle}>{title}</h3>
                          <span
                            className={`${style.badge} ${getStatusBadgeClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className={style.amountText}>
                          {currencySymbol}
                          {Number(
                            sub.original_amount || sub.total_amount || 0
                          ).toLocaleString()}{" "}
                          / month
                        </div>

                        <p className={style.metaText}>
                          <strong>Donor:</strong> {sub.first_name} {sub.last_name} ({sub.email})
                        </p>

                        <p className={style.metaText}>
                          <strong>Started:</strong>{" "}
                          {new Date(sub.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>

                        {sub.razorpay_subscription_id && (
                          <p className={style.subIdText}>
                            Ref: {sub.razorpay_subscription_id}
                          </p>
                        )}
                      </div>

                      <div className={style.actionContainer}>
                        {status === "active" && (
                          <>
                            <button
                              className={`${style.btnAction} ${style.btnPause}`}
                              disabled={loadingAction?.id === sub.id}
                              onClick={() => handlePause(sub)}
                            >
                              {loadingAction?.id === sub.id && loadingAction?.action === "pause" ? "Processing..." : "Pause"}
                            </button>
                            <button
                              className={`${style.btnAction} ${style.btnCancel}`}
                              disabled={loadingAction?.id === sub.id}
                              onClick={() => handleCancel(sub)}
                            >
                              {loadingAction?.id === sub.id && loadingAction?.action === "cancel" ? "Processing..." : "Cancel"}
                            </button>
                          </>
                        )}

                        {status === "paused" && (
                          <>
                            <button
                              className={`${style.btnAction} ${style.btnResume}`}
                              disabled={loadingAction?.id === sub.id}
                              onClick={() => handleResume(sub)}
                            >
                              {loadingAction?.id === sub.id && loadingAction?.action === "resume" ? "Processing..." : "Resume"}
                            </button>
                            <button
                              className={`${style.btnAction} ${style.btnCancel}`}
                              disabled={loadingAction?.id === sub.id}
                              onClick={() => handleCancel(sub)}
                            >
                              {loadingAction?.id === sub.id && loadingAction?.action === "cancel" ? "Processing..." : "Cancel"}
                            </button>
                          </>
                        )}

                        {status === "cancelled" && (
                          <span
                            style={{
                              fontSize: "1.3rem",
                              color: "#991b1b",
                              fontStyle: "italic",
                              textAlign: "center",
                            }}
                          >
                            Cancelled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
};

export default ManageSubscription;
