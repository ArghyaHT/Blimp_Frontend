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
import { useLocation, useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import api from "../../api/api";
import Pagination from "@mui/material/Pagination";
import { convert } from "html-to-text";
import campaignDummy from "../../assets/campaign_dummy.jpeg";

const FeatureDetail = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const featureItem = location.state;

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

  const campaign = featureItemDetail?.data?.data || featureItem;
  const campaignUpdates = featureItemDetail?.data?.data?.campaignUpdates || [];
  const rawSupportersList = totalSupporters?.data?.data?.campaign?.donationInfo || featureItemDetail?.data?.data?.donationInfo || [];

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
          url: window.location.href,
        })
        .catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", { style: toastStyle });
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

  const campaignId = featureItem?.id || featureItemDetail?.data?.data?.id || location.state?.id;

  useEffect(() => {
    window.scrollTo(0, 0);
    const idToUse = featureItem?.id || location.state?.id;
    if (idToUse) {
      const fetchCampaignDetails = async () => {
        try {
          setFeatureItemDetail((prev) => ({
            ...prev,
            loading: true,
            error: null,
          }));
          const { data } = await api.post("/view-campaign-history", {
            id: idToUse,
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
  }, [featureItem?.id, location.state?.id]);

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
            <Skeleton variant="rectangular" width={"100%"} height={"4rem"} />
          ) : (
            <h2>{featureItemDetail?.data?.data?.campaign_name}</h2>
          )}

          {featureItemDetail?.loading ? (
            <Skeleton variant="rectangular" width={"100%"} height={"56rem"} />
          ) : (
            <img src={featureItemDetail?.data?.data?.banner_image} alt="" />
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
                    <button>
                      <InstagramIcon />
                    </button>
                    <button>
                      <FacebookIcon />
                    </button>
                    <button>
                      <TwitterXIcon />
                    </button>
                    <button>
                      <WhatsappIcon />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      navigate("/checkout", { state: campaign });
                    }}
                    ref={donateTriggerRef}
                  >
                    donate
                  </button>
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
              onClick={() => setActiveTab("updates")}
            >
              Updates {campaignUpdates.length > 0 && <span className={style.tabCountBadge}>{campaignUpdates.length}</span>}
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
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      {convert(
                        featureItem?.description
                          .replace(/\\n/g, "")
                          ?.replace(/^"(.*)"$/, "$1"),
                        options,
                      )}
                    </p>
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
          <button
            className={style.stickyDonateButton}
            onClick={() => navigate("/checkout", { state: campaign })}
          >
            Donate Now
          </button>
        </div>
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
                  className={style.modalDonateBtn}
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
