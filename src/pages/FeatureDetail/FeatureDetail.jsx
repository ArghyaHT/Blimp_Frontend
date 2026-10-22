import React, { useEffect, useRef, useState } from "react";
import style from "./FeatureDetail.module.css";
import {
  FacebookIcon,
  InstagramIcon,
  TwitterXIcon,
  WhatsappIcon,
} from "../../icons";
import moment from "moment";
import toast from "react-hot-toast";
import { toastStyle } from "../../utils/toastStyles";

import FirstMedal from "../../assets/medal1st.png";
import SecondMedal from "../../assets/medal2nd.png";
import ThirdMedal from "../../assets/medal3rd.png";
import BlogCard from "../../components/BlogCard/BlogCard";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import api from "../../api/api";
import Pagination from "@mui/material/Pagination";
import { convert } from "html-to-text";
import campaignDummy from "../../assets/campaign_dummy.jpeg";
import VerifiedBadge from "../../components/VerifiedBadge/VerifiedBadge";
import { isVerifiedCampaign } from "../../utils/campaignUtils";
import { useAuth } from "../../context/AuthContext";
import { getSeenCount, markUpdatesSeen } from "../../utils/updatesBadge";
import CampaignShareModal from "../../components/CampaignShareModal/CampaignShareModal";
import { buildShareMessage, shareToInstagram } from "../../utils/shareMessage";

const FeatureDetail = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { campaignSlug: routeCampaignSlug } = useParams();
  const featureItem = location.state;

  // Auth state — used to decide badge colour
  const { isAuthenticated } = useAuth();

  const [featureItemDetail, setFeatureItemDetail] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const [totalSupporters, setTotalSupporters] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const [latestArticles, setLatestArticles] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const [activeTab, setActiveTab] = useState("story");
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalSupporterData, setTotalSupporterData] = useState(0);

  // Updates Lightbox Modal & Interaction states
  const [selectedUpdateModal, setSelectedUpdateModal] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [likedUpdates, setLikedUpdates] = useState({});
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [updateComments, setUpdateComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [visibleUpdatesCount, setVisibleUpdatesCount] = useState(3);
  const [showCampaignShare, setShowCampaignShare] = useState(false);

  // Track unseen update count refresh — incremented when seen state is written
  const [seenVersion, setSeenVersion] = useState(0);

  const campaign = featureItemDetail?.data?.data || featureItem;
  const campaignUpdates = featureItemDetail?.data?.data?.campaignUpdates || [];
  const rawSupportersList = totalSupporters?.data?.data?.campaign?.donationInfo || featureItemDetail?.data?.data?.donationInfo || [];

  const formatFullNumber = (num) => {
    if (num == null || num === "") return "0";
    const cleanStr = String(num).replace(/[^0-9.]/g, "");
    if (!cleanStr) return "0";
    const numericVal = Number(cleanStr);
    if (isNaN(numericVal)) return "0";

    const isINR =
      (campaign?.country?.currency &&
        String(campaign?.country?.currency).toUpperCase() === "INR") ||
      campaign?.country?.symbol === "₹" ||
      campaign?.country?.symbol === "Rs" ||
      campaign?.country?.symbol === "Rs.";

    return numericVal.toLocaleString(isINR ? "en-IN" : "en-US", {
      maximumFractionDigits: 2,
    });
  };

  const getSupporterAmount = (item) => {
    if (!item) return 0;
    const val = item.display_amount ?? item.original_amount ?? item.total_amount ?? 0;
    return Number(val) || 0;
  };

  const supportersList = [...rawSupportersList].sort((a, b) => {
    const amtA = getSupporterAmount(a);
    const amtB = getSupporterAmount(b);
    if (amtB !== amtA) {
      return amtB - amtA;
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleToggleLike = (updateId) => {
    setLikedUpdates((prev) => {
      const isLiked = !prev[updateId];
      if (isLiked) {
        toast.success("Reacted to update!", { style: toastStyle });
      }
      return { ...prev, [updateId]: isLiked };
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim() || !selectedUpdateModal) return;
    const updateId = selectedUpdateModal.id;
    const newComment = {
      user: "You",
      text: commentText.trim(),
      createdAt: new Date(),
    };
    setUpdateComments((prev) => ({
      ...prev,
      [updateId]: [...(prev[updateId] || []), newComment],
    }));
    setCommentText("");
    toast.success("Comment posted!", { style: toastStyle });
  };

  const handleShareUpdate = () => {
    if (navigator.share) {
      navigator
        .share({
          title: selectedUpdateModal?.title || "Campaign Update",
          url: campaignShareUrl,
        })
        .catch(() => { });
    } else {
      navigator.clipboard?.writeText(campaignShareUrl)
        .then(() => toast.success("Link copied to clipboard!", { style: toastStyle }))
        .catch(() => toast.error("Could not copy the link.", { style: toastStyle }));
    }
  };

  const isMediaVideo = (item) => {
    if (!item) return false;
    const type = typeof item === "string" ? "" : item.type || "";
    const url = typeof item === "string" ? item : item.url || "";
    return (
      type === "video" ||
      url.includes("/video/upload/") ||
      /\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i.test(url)
    );
  };

  const getMediaUrl = (item) => {
    if (!item) return "";
    return typeof item === "string" ? item : item.url || "";
  };

  const renderUpdateBadge = (update) => {
    if (!update) return "Update";
    const media = update.media || [];
    const hasVideo = media.some((m) => isMediaVideo(m));
    if (hasVideo) return "Video";
    if (media.length >= 1) return `${media.length} ${media.length === 1 ? "Photo" : "Photos"}`;
    return "Update";
  };

  const isVideoUpdate = (update) => {
    return update?.media?.some((m) => isMediaVideo(m));
  };

  // Numeric id (still needed by id-based APIs) and slug (used in URLs).
  const campaignId =
    featureItemDetail?.data?.data?.id ||
    featureItem?.id ||
    (/^\d+$/.test(String(routeCampaignSlug || "")) ? routeCampaignSlug : undefined);
  const campaignSlug =
    featureItemDetail?.data?.data?.slug || featureItem?.slug || routeCampaignSlug;
  // Social apps (WhatsApp, Facebook, X, LinkedIn) fetch the preview card from the
  // shared URL, so it must be the public site — never localhost.
  const isLocalHost = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(window.location.hostname);
  const publicOrigin = import.meta.env.VITE_PUBLIC_SITE_URL
    || (isLocalHost ? "https://blimpweb.netlify.app" : window.location.origin);
  const campaignShareUrl = campaignSlug
    ? `${publicOrigin}/campaign/${encodeURIComponent(campaignSlug)}`
    : window.location.href;

  const shareCampaignOn = (platform) => {
    const encodedUrl = encodeURIComponent(campaignShareUrl);
    const shareMessage = buildShareMessage(campaign, campaignShareUrl);
    const shareTargets = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
      x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(buildShareMessage(campaign, campaignShareUrl, { includeUrl: false }).slice(0, 230))}&url=${encodedUrl}`,
    };

    if (platform === "instagram") {
      shareToInstagram({
        campaign,
        shareUrl: campaignShareUrl,
        notify: (type, message) => toast[type](message, { style: toastStyle }),
      });
      return;
    }

    window.open(shareTargets[platform], "_blank", "noopener,noreferrer,width=640,height=640");
  };

  // ── Badge logic ──────────────────────────────────────────────────────────
  // Number of updates the logged-in user has already seen (from localStorage).
  // Non-logged-in users always have seenCount = 0 so the badge is always red.
  const seenCount = isAuthenticated ? getSeenCount(campaignId) : 0;
  const newUpdatesCount = campaignUpdates.length - seenCount;
  const hasNewUpdates = newUpdatesCount > 0;

  // Badge is red when: user is not logged in  OR  there are unseen updates
  const badgeIsRed = !isAuthenticated || hasNewUpdates;

  // Handler for the Updates tab click — switches tab AND marks updates as seen
  const handleUpdatesTabClick = () => {
    setActiveTab("updates");
    if (isAuthenticated && campaignId && campaignUpdates.length > 0) {
      markUpdatesSeen(campaignId, campaignUpdates.length);
      // Trigger a re-render so badgeIsRed re-evaluates
      setSeenVersion((v) => v + 1);
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    window.scrollTo(0, 0);
    const idToUse = routeCampaignSlug || featureItem?.slug || featureItem?.id;
    if (idToUse) {
      const fetchCampaignDetails = async () => {
        try {
          setFeatureItemDetail((prev) => ({
            ...prev,
            loading: true,
            error: null,
          }));
          const { data } = await api.post("/view-campaign-history", {
            slug: idToUse,
          });
          if (data.code === 200) {
            setFeatureItemDetail({ loading: false, error: null, data });
          } else if (data.code === 400) {
            setFeatureItemDetail({
              loading: false,
              error: data.message,
              data: {},
            });
          }
        } catch (error) {
          setFeatureItemDetail({
            loading: false,
            error: error.message,
            data: {},
          });
        }
      };

      const fetchLatestArticles = async () => {
        setLatestArticles((prev) => ({ ...prev, loading: true, error: null }));
        try {
          const { data } = await api.post("/get-latest-article");
          if (data.code === 200) {
            setLatestArticles({ loading: false, error: null, data });
          } else if (data.code === 400) {
            setLatestArticles({
              loading: false,
              error: data.message,
              data: {},
            });
          }
        } catch (error) {
          setLatestArticles({ loading: false, error: error.message, data: {} });
        }
      };

      fetchCampaignDetails();
      fetchLatestArticles();
    }
  }, [featureItem?.id, featureItem?.slug, routeCampaignSlug]);

  // If the user is already on the Updates tab when data loads, mark as seen
  useEffect(() => {
    if (
      isAuthenticated &&
      activeTab === "updates" &&
      campaignUpdates.length > 0 &&
      campaignId
    ) {
      markUpdatesSeen(campaignId, campaignUpdates.length);
      setSeenVersion((v) => v + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignUpdates.length, activeTab, isAuthenticated, campaignId]);

  useEffect(() => {
    if (campaignId) {
      const fetchTotalSupporters = async () => {
        try {
          setTotalSupporters((prev) => ({
            ...prev,
            loading: true,
            error: null,
          }));
          const { data } = await api.post("/total-supporters", {
            id: campaignId,
            page,
          });

          setTotalPages(data?.data?.pagination?.totalPages || 0);
          setTotalSupporterData(data?.data?.pagination?.total || data?.data?.campaign?.donationInfo?.length || 0);

          if (data.code === 200) {
            setTotalSupporters({ loading: false, error: null, data });
          } else if (data.code === 400) {
            setTotalSupporters({
              loading: false,
              error: data.message,
              data: {},
            });
          }
        } catch (error) {
          setTotalSupporters({
            loading: false,
            error: error.message,
            data: {},
          });
        }
      };

      fetchTotalSupporters();
    }
  }, [page, campaignId]);

  const options = {
    wordwrap: false,
    selectors: [
      { selector: "h1", format: "block" },
      { selector: "p", format: "block" },
    ],
  };

  const getCampaignDescription = () => {
    const raw =
      featureItemDetail?.data?.data?.description ??
      featureItemDetail?.data?.data?.campaign_details ??
      featureItemDetail?.data?.data?.rasing_funds_decription ??
      campaign?.description ??
      campaign?.campaign_details ??
      featureItem?.description ??
      "";

    if (!raw) return "";

    let cleaned = raw;
    if (typeof cleaned === "string") {
      cleaned = cleaned.trim();
      if (
        (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
        (cleaned.startsWith("'") && cleaned.endsWith("'"))
      ) {
        try {
          cleaned = JSON.parse(cleaned);
        } catch (e) {
          cleaned = cleaned.slice(1, -1);
        }
      }
      if (typeof cleaned === "string") {
        cleaned = cleaned.replace(/\\n/g, "\n").replace(/\\"/g, '"');
      }
    }
    return typeof cleaned === "string" ? cleaned : "";
  };

  const campaignDescription = getCampaignDescription();
  const isHtmlDescription =
    typeof campaignDescription === "string" &&
    /<[a-z][\s\S]*>/i.test(campaignDescription);

  const [showStickyDonate, setShowStickyDonate] = useState(false);
  const donateTriggerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!donateTriggerRef.current) return;

      const triggerPoint =
        donateTriggerRef.current.getBoundingClientRect().bottom;

      if (triggerPoint < 0 && window.innerWidth <= 768) {
        setShowStickyDonate(true);
      } else {
        setShowStickyDonate(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main>
      <section className={style.featureDetailContainer}>
        <div>
          {featureItemDetail?.loading ? (
            <Skeleton variant="rectangular" width={"100%"} height={"4.5rem"} />
          ) : (
            <h2 className={style.campaignHeading}>{featureItemDetail?.data?.data?.campaign_name}</h2>
          )}

          {featureItemDetail?.loading ? (
            <Skeleton variant="rectangular" width={"100%"} height={"56rem"} />
          ) : (
            <div className={style.mainBannerWrapper}>
              <img src={featureItemDetail?.data?.data?.banner_image} alt="" />
              {isVerifiedCampaign(campaign) && <VerifiedBadge />}
            </div>
          )}

          <div className={style.donationContainer}>
            {featureItemDetail?.loading ? (
              <Skeleton variant="rectangular" width={"100%"} height={"4rem"} />
            ) : (
              <p>
                Published by:{" "}
                <b>{featureItemDetail?.data?.data?.campaigns?.fullname}</b>
              </p>
            )}

            {featureItemDetail?.loading ? (
              <Skeleton variant="rectangular" width={"100%"} height={"10rem"} />
            ) : (
              <>
                <ProgressBar
                  raisedAmount={featureItemDetail?.data?.data?.raisedAmount}
                  targetAmount={featureItemDetail?.data?.data?.targetAmount}
                  percentageAchieved={
                    featureItemDetail?.data?.data?.percentageAchieved
                  }
                  donationCount={
                    featureItemDetail?.data?.data?.donationInfo?.length
                  }
                  currency={featureItemDetail?.data?.data?.country?.currency}
                  symbol={featureItemDetail?.data?.data?.country?.symbol}
                />

                <div className={style.linkContainer}>
                  <div>
                    <button aria-label="Share on Instagram" onClick={() => shareCampaignOn("instagram")}>
                      <InstagramIcon />
                    </button>
                    <button aria-label="Share on Facebook" onClick={() => shareCampaignOn("facebook")}>
                      <FacebookIcon />
                    </button>
                    <button aria-label="Share on X" onClick={() => shareCampaignOn("x")}>
                      <TwitterXIcon />
                    </button>
                    <button aria-label="Share on WhatsApp" onClick={() => shareCampaignOn("whatsapp")}>
                      <WhatsappIcon />
                    </button>
                  </div>

                  <div className={style.donateShareGroup}>
                    <button
                      className="btn-3d btn-3d--secondary"
                      onClick={() => setShowCampaignShare(true)}
                    >
                      Share
                    </button>

                    <button
                      onClick={() => {
                        navigate("/checkout", { state: campaign });
                      }}
                      ref={donateTriggerRef}
                      className="glossy-btn"
                    >
                      Donate
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tabs Navigation Header */}
          <div className={style.tabsNavContainer}>
            <button
              className={activeTab === "story" ? style.activeTabBtn : style.tabBtn}
              onClick={() => setActiveTab("story")}
            >
              Story
            </button>
            <button
              className={activeTab === "updates" ? style.activeTabBtn : style.tabBtn}
              onClick={handleUpdatesTabClick}
            >
              Updates{" "}
              {campaignUpdates.length > 0 && (
                <span
                  className={`${style.tabCountBadge} ${badgeIsRed ? style.tabCountBadgeRed : ""}`}
                >
                  {campaignUpdates.length}
                </span>
              )}
            </button>
            <button
              className={activeTab === "supporters" ? style.activeTabBtn : style.tabBtn}
              onClick={() => setActiveTab("supporters")}
            >
              Supporters {(totalSupporterData || supportersList.length || 0) > 0 && (
                <span className={style.tabCountBadge}>
                  {totalSupporterData || supportersList.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === "story" && (
            <>
              <div>
                {featureItemDetail?.loading ? (
                  <Skeleton variant="rectangular" width={"100%"} height={"10rem"} />
                ) : (
                  <>
                    <h2>Campaign Details</h2>
                    <p>
                      {featureItemDetail?.data?.data?.categories?.name} |{" "}
                      {featureItemDetail?.data?.data?.country?.name}
                    </p>
                  </>
                )}
              </div>

              <div>
                {featureItemDetail?.loading ? (
                  <Skeleton
                    variant="rectangular"
                    width={"100%"}
                    height={"10rem"}
                  />
                ) : (
                  <>
                    <h2>Raising fund description</h2>
                    {isHtmlDescription ? (
                      <div
                        className={style.descriptionHtmlContent}
                        dangerouslySetInnerHTML={{ __html: campaignDescription }}
                      />
                    ) : (
                      <p style={{ whiteSpace: "pre-wrap" }}>
                        {campaignDescription
                          ? convert(campaignDescription, options) || campaignDescription
                          : "No description provided."}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className={style.addGalleryContainer}>
                {featureItemDetail?.loading ? (
                  <Skeleton
                    variant="rectangular"
                    width={"100%"}
                    height={"15rem"}
                  />
                ) : (
                  featureItemDetail?.data?.data?.campaignsImages?.map(
                    (item, index) => {
                      return <img key={item.id} src={item.image} alt="" />;
                    },
                  )
                )}
              </div>

              <div className={style.addsContainer}>
                <h2>Run Ads / Causes section</h2>
              </div>
            </>
          )}

          {activeTab === "updates" && (
            <div className={style.updatesTabContainer}>
              {campaignUpdates.length === 0 ? (
                <div className={style.emptyUpdatesBox}>
                  <p>No updates have been posted for this campaign yet.</p>
                </div>
              ) : (
                <>
                  <div className={style.updatesGrid}>
                    {campaignUpdates
                      .slice(0, visibleUpdatesCount)
                      .map((update) => {
                        const mediaList = update.media || [];
                        const firstMedia = mediaList.length > 0 ? mediaList[0] : null;
                        const isFirstVideo = isMediaVideo(firstMedia);
                        const mediaUrl = getMediaUrl(firstMedia) || campaign?.banner_image || campaignDummy;
                        const badgeText = renderUpdateBadge(update);
                        const hasVideo = isVideoUpdate(update);

                        return (
                          <div
                            key={update.id}
                            className={style.updateCardTile}
                            onClick={() => {
                              setSelectedUpdateModal(update);
                              setActiveMediaIndex(0);
                              setShowCommentInput(false);
                            }}
                          >
                            {isFirstVideo ? (
                              <video
                                src={`${mediaUrl}#t=0.5`}
                                preload="metadata"
                                muted
                                playsInline
                                className={style.updateCardCover}
                              />
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={update.title}
                                className={style.updateCardCover}
                              />
                            )}
                            <div className={style.updateCardOverlay} />

                            {/* Badge Top Right */}
                            <span className={style.updateTileBadge}>{badgeText}</span>

                            {/* Play Icon if video */}
                            {hasVideo && (
                              <div className={style.playIconCircle}>
                                <svg
                                  width="22"
                                  height="22"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              </div>
                            )}

                            {/* Bottom Text Overlay */}
                            <div className={style.updateTileFooter}>
                              <h4>{update.title}</h4>
                              <p>{moment(update.createdAt).format("Do MMMM YYYY")}</p>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  {campaignUpdates.length > 3 && (
                    <div className={style.viewMoreUpdatesWrapper}>
                      {visibleUpdatesCount < campaignUpdates.length ? (
                        <button
                          className={style.viewMoreUpdatesBtn}
                          onClick={() => setVisibleUpdatesCount(campaignUpdates.length)}
                        >
                          View all updates
                        </button>
                      ) : (
                        <button
                          className={style.viewMoreUpdatesBtn}
                          onClick={() => setVisibleUpdatesCount(3)}
                        >
                          Show fewer updates
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "supporters" && (
            <div className={style.supporterContainer}>
              <h2>
                Supporters({totalSupporterData || supportersList.length})
              </h2>
              {totalSupporters?.loading ? (
                <div>
                  {[1, 2, 3].map((n) => (
                    <Skeleton
                      key={n}
                      variant="rectangular"
                      height="6rem"
                      style={{ borderRadius: "8px", marginBottom: "1.2rem" }}
                    />
                  ))}
                </div>
              ) : supportersList.length > 0 ? (
                <div className={style.supporterListWrapper}>
                  {supportersList.map((item, index) => {
                    const isTopThreeOnPage1 = Number(page) === 1;

                    return (
                      <div key={item.id || index} className={style.supporterItem}>
                        <div>
                          {isTopThreeOnPage1 && index === 0 ? (
                            <img src={FirstMedal} alt="Gold Medal" />
                          ) : isTopThreeOnPage1 && index === 1 ? (
                            <img src={SecondMedal} alt="Silver Medal" />
                          ) : isTopThreeOnPage1 && index === 2 ? (
                            <img src={ThirdMedal} alt="Bronze Medal" />
                          ) : (
                            <span></span>
                          )}

                          <div>
                            <h2>
                              {item.is_anonymous
                                ? "A"
                                : `${item?.first_name?.slice(0, 1) || ""}${item?.last_name?.slice(0, 1) || ""}` || "A"}
                            </h2>
                          </div>
                        </div>

                        <div>
                          <h3>
                            {item.is_anonymous
                              ? "Anonymous"
                              : `${item.first_name || ""} ${item.last_name || ""}`.trim() || "Anonymous"}
                          </h3>
                          {isTopThreeOnPage1 && (index === 0 || index === 1 || index === 2) ? (
                            <p>Top Contributor</p>
                          ) : (
                            <span />
                          )}
                        </div>

                        <div>
                          <h3>{campaign?.country?.symbol || "₹"} {item.display_amount ?? item.original_amount ?? item.total_amount}</h3>
                          <p>{moment(item?.createdAt).fromNow()}</p>
                        </div>
                      </div>
                    );
                  })}

                  <div className={style.supporterPaginationContainer}>
                    <Pagination
                      count={totalPages}
                      page={page}
                      size="large"
                      sx={{
                        "& .MuiPaginationItem-page": {
                          fontSize: "1.4rem",
                        },
                      }}
                      onChange={handlePageChange}
                      disabled={totalSupporters?.loading}
                    />
                  </div>
                </div>
              ) : (
                <div className={style.emptyUpdatesBox}>
                  <p>No supporters yet for this campaign.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className={style.blogsContainer}>
        <div>
          <div>
            <h2>latest news and blog</h2>
            <button
              onClick={() => {
                navigate("/news-blog");
              }}
            >
              <span>more news</span>
            </button>
          </div>

          <div className={style.blogCardContainer}>
            {latestArticles?.loading
              ? [0, 1, 2, 3, 4, 5].map((item) => {
                return (
                  <Skeleton
                    key={item}
                    variant="rectangular"
                    height={"30rem"}
                    sx={{
                      width: {
                        xs: "100%", // mobile
                        sm: "48%", // tablet
                        md: "32%", // desktop
                      },
                    }}
                  />
                );
              })
              : latestArticles?.data?.data?.nextArticles
                ?.slice(0, 3)
                ?.map((item, index) => {
                  return (
                    <BlogCard
                      index={index}
                      key={item.id}
                      articleItem={item}
                    />
                  );
                })}
          </div>

          <button>more news</button>
        </div>
      </section>

      {showStickyDonate && (
        <div className={style.stickyDonateWrapper}>
          <div className={style.stickyDonateCard}>
            {/* Top Row: Progress Ring & Raised Text */}
            <div className={style.stickyInfoRow}>
              {(() => {
                const stickyTarget = Number(
                  (typeof campaign?.targetAmount === "string"
                    ? campaign.targetAmount.replace(/[^0-9.]/g, "")
                    : campaign?.targetAmount ?? campaign?.target_amount) || 0
                );
                const stickyRaised = Number(
                  (typeof campaign?.raisedAmount === "string"
                    ? campaign.raisedAmount.replace(/[^0-9.]/g, "")
                    : campaign?.raisedAmount ?? campaign?.raised_amount) || 0
                );
                const stickyPercentage =
                  stickyTarget > 0
                    ? Math.round((stickyRaised / stickyTarget) * 100)
                    : Math.round(Number(campaign?.percentageAchieved || 0));

                return (
                  <>
                    <div className={style.stickyProgressRingWrapper}>
                      <svg className={style.stickyProgressSvg} viewBox="0 0 44 44">
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          className={style.stickyProgressBg}
                        />
                        <circle
                          cx="22"
                          cy="22"
                          r="18"
                          className={style.stickyProgressFg}
                          style={{
                            strokeDasharray: 113.1,
                            strokeDashoffset:
                              113.1 -
                              (Math.min(100, Math.max(0, stickyPercentage)) / 100) *
                                113.1,
                          }}
                        />
                      </svg>
                      <span className={style.stickyProgressText}>
                        {stickyPercentage}%
                      </span>
                    </div>

                    <div className={style.stickyTextGroup}>
                      <div className={style.stickyRaisedText}>
                        <strong>
                          {campaign?.country?.symbol || "₹"}
                          {formatFullNumber(campaign?.raisedAmount)} raised
                        </strong>{" "}
                        of {campaign?.country?.symbol || "₹"}
                        {formatFullNumber(campaign?.targetAmount)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Bottom Row: Donate & Share Buttons */}
            <div className={style.stickyActionsRow}>
              <button
                className={`${style.stickyDonateBtn} glossy-btn`}
                onClick={() => navigate("/checkout", { state: campaign })}
              >
                Donate
              </button>
              <button
                className={`${style.stickyShareBtn} btn-3d btn-3d--secondary`}
                onClick={() => setShowCampaignShare(true)}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {showCampaignShare && campaign && (
        <CampaignShareModal
          campaign={campaign}
          shareUrl={campaignShareUrl}
          onClose={() => setShowCampaignShare(false)}
        />
      )}

      {/* Lightbox / Update Detail Modal */}
      {selectedUpdateModal && (
        <div
          className={style.modalOverlay}
          onClick={() => setSelectedUpdateModal(null)}
        >
          <div
            className={style.modalBox}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={style.modalHeader}>
              <div className={style.modalAuthorGroup}>
                {selectedUpdateModal.userInfo?.user_profile ? (
                  <img
                    src={selectedUpdateModal.userInfo.user_profile}
                    alt=""
                    className={style.modalAuthorAvatar}
                  />
                ) : (
                  <div className={style.modalAuthorAvatarFallback}>
                    {(
                      selectedUpdateModal.userInfo?.fullname ||
                      campaign?.campaigns?.fullname ||
                      "C"
                    ).charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className={style.modalAuthorName}>
                    {selectedUpdateModal.userInfo?.fullname ||
                      campaign?.campaigns?.fullname ||
                      "Campaigner"}
                  </h4>
                  <span className={style.modalTimeText}>
                    {moment(selectedUpdateModal.createdAt).format("DD MMM YYYY, HH:mm")}
                  </span>
                </div>
              </div>

              <div className={style.modalHeaderActions}>
                <span className={style.modalHeaderPill}>
                  {renderUpdateBadge(selectedUpdateModal)}
                </span>
                <button
                  className={style.modalCloseBtn}
                  onClick={() => setSelectedUpdateModal(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Media Carousel / Lightbox Display */}
            {selectedUpdateModal.media && selectedUpdateModal.media.length > 0 && (
              <div className={style.modalMediaStage}>
                <div className={style.modalMediaWrapper}>
                  {isMediaVideo(selectedUpdateModal.media[activeMediaIndex]) ? (
                    <video
                      key={getMediaUrl(selectedUpdateModal.media[activeMediaIndex])}
                      src={getMediaUrl(selectedUpdateModal.media[activeMediaIndex])}
                      controls
                      autoPlay
                      playsInline
                      className={style.modalStageVideo}
                    />
                  ) : (
                    <img
                      src={getMediaUrl(selectedUpdateModal.media[activeMediaIndex])}
                      alt=""
                      className={style.modalStageImage}
                    />
                  )}

                  {/* Media Counter Badge */}
                  {selectedUpdateModal.media.length > 1 && (
                    <span className={style.modalCounterPill}>
                      {activeMediaIndex + 1} / {selectedUpdateModal.media.length}
                    </span>
                  )}

                  {/* Nav Arrows */}
                  {selectedUpdateModal.media.length > 1 && (
                    <>
                      {activeMediaIndex > 0 && (
                        <button
                          className={`${style.modalMediaNavBtn} ${style.modalNavLeft}`}
                          onClick={() => setActiveMediaIndex((prev) => prev - 1)}
                        >
                          ‹
                        </button>
                      )}
                      {activeMediaIndex < selectedUpdateModal.media.length - 1 && (
                        <button
                          className={`${style.modalMediaNavBtn} ${style.modalNavRight}`}
                          onClick={() => setActiveMediaIndex((prev) => prev + 1)}
                        >
                          ›
                        </button>
                      )}
                    </>
                  )}

                  {/* Dots indicator */}
                  {selectedUpdateModal.media.length > 1 && (
                    <div className={style.modalDotsBar}>
                      {selectedUpdateModal.media.map((_, idx) => (
                        <span
                          key={idx}
                          className={`${style.modalDotItem} ${idx === activeMediaIndex ? style.modalDotActive : ""
                            }`}
                          onClick={() => setActiveMediaIndex(idx)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Text & Content */}
            <div className={style.modalBodyContent}>
              <h3>{selectedUpdateModal.title}</h3>
              <p className={style.modalTextBody}>
                {selectedUpdateModal.update_text}
              </p>

              {/* Comment Section if toggled */}
              {showCommentInput && (
                <div className={style.modalCommentsWrapper}>
                  <h5>Comments</h5>
                  <div className={style.commentInputRow}>
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment();
                      }}
                    />
                    <button onClick={handleAddComment}>Post</button>
                  </div>
                  <div className={style.commentsListContainer}>
                    {(updateComments[selectedUpdateModal.id] || []).length === 0 ? (
                      <p className={style.noCommentsHint}>No comments yet. Be the first to comment!</p>
                    ) : (
                      (updateComments[selectedUpdateModal.id] || []).map((c, i) => (
                        <div key={i} className={style.singleCommentBox}>
                          <strong>{c.user}</strong>: <span>{c.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar Footer */}
            <div className={style.modalFooterBar}>
              {/* <div className={style.footerLeftGroup}>
                <button
                  className={`${style.actionBtnPill} ${
                    likedUpdates[selectedUpdateModal.id] ? style.actionLiked : ""
                  }`}
                  onClick={() => handleToggleLike(selectedUpdateModal.id)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={likedUpdates[selectedUpdateModal.id] ? "#ef4444" : "none"}
                    stroke={likedUpdates[selectedUpdateModal.id] ? "#ef4444" : "#475569"}
                    strokeWidth="2"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>
                    {likedUpdates[selectedUpdateModal.id] ? "Reacted (1)" : "React"}
                  </span>
                </button>

                <button
                  className={style.actionBtnPill}
                  onClick={() => setShowCommentInput((prev) => !prev)}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>
                    Comment{" "}
                    {(updateComments[selectedUpdateModal.id] || []).length > 0
                      ? `(${(updateComments[selectedUpdateModal.id] || []).length})`
                      : ""}
                  </span>
                </button>
              </div> */}

              <div className={style.footerRightGroup} style={{ marginLeft: "auto" }}>
                <button className={style.actionBtnPill} onClick={handleShareUpdate}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  <span>Share</span>
                </button>

                <button
                  className={`${style.modalDonateBtn} glossy-btn`}
                  onClick={() => {
                    setSelectedUpdateModal(null);
                    navigate("/checkout", { state: campaign });
                  }}
                >
                  Donate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default FeatureDetail;
