import React, { useEffect, useRef, useState } from "react";
import style from "./Hero.module.css";
import crowdImageOne from "../../assets/crowdImageOne.jpg";
import { FilterIcon, RightIcon } from "../../icons";
import FeatureCard from "../../components/FeatureCard/FeatureCard";
import RegionMapContainer from "../../components/RegionMap/RegionMap";
import NewsCard from "../../components/NewsCard/NewsCard";
import BiographImage from "../../assets/biograph.jpg";
import FocusCard from "../../components/FocusCard/FocusCard";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import CampaignCard from "../../components/CampaignCard/CampaignCard";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import Skeleton from "@mui/material/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { convert } from "html-to-text";
import { Pagination } from "@mui/material";
import FeatureCardMobile from "../../components/FeatureCardMobile/FeatureCardMobile";

import HeroCarouselOne from "../../assets/hero_carousel_one.svg";
import HeroCarouselTwo from "../../assets/hero_carousel_two.svg";
import HeroCarouselThree from "../../assets/hero_carousel_three.svg";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [supportCampaigns, setSupportCampaigns] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const [latestCampaigns, setLatestCampaigns] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const [featuredCampaigns, setFeaturedCampaigns] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const [latestArticles, setLatestArticles] = useState({
    loading: false,
    error: null,
    data: {},
  });

  useEffect(() => {
    const fetchSupportCampaigns = async () => {
      setSupportCampaigns((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.post("/get-support-campaign");
        if (data.code === 200) {
          setSupportCampaigns({ loading: false, error: null, data });
        } else if (data.code === 400) {
          setSupportCampaigns({
            loading: false,
            error: data.message,
            data: {},
          });
        }
      } catch (error) {
        setSupportCampaigns({ loading: false, error: error.message, data: {} });
      }
    };

    const fetchLatestCampaigns = async () => {
      setLatestCampaigns((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.post("/get-top-campaigns");
        if (data.code === 200) {
          setLatestCampaigns({ loading: false, error: null, data });
        } else if (data.code === 400) {
          setLatestCampaigns({ loading: false, error: data.message, data: {} });
        }
      } catch (error) {
        setLatestCampaigns({ loading: false, error: error.message, data: {} });
      }
    };

    const fetchLatestArticles = async () => {
      setLatestArticles((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.post("/get-latest-article");
        if (data.code === 200) {
          setLatestArticles({ loading: false, error: null, data });
        } else if (data.code === 400) {
          setLatestArticles({ loading: false, error: data.message, data: {} });
        }
      } catch (error) {
        setLatestArticles({ loading: false, error: error.message, data: {} });
      }
    };

    fetchSupportCampaigns();
    fetchLatestCampaigns();
    fetchLatestArticles();
  }, []);

  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      setFeaturedCampaigns((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.post("/get-featured-campaign", {
          page,
        });
        if (data.code === 200) {
          setFeaturedCampaigns({ loading: false, error: null, data });
          setTotalPages(data?.pagination?.totalPages);
        } else if (data.code === 400) {
          setFeaturedCampaigns({
            loading: false,
            error: data.message,
            data: {},
          });
        }
      } catch (error) {
        setFeaturedCampaigns({
          loading: false,
          error: error.message,
          data: {},
        });
      }
    };

    fetchFeaturedCampaigns();
  }, [page]);

  const [visibleFeatureCount, setVisibleFeatureCount] = useState(6);

  const allFeatureItems = featuredCampaigns?.data?.data || [];

  const handleShowAllFeatureItems = () => {
    setVisibleFeatureCount(allFeatureItems.length);
  };

  const options = {
    // wordwrap: 130,
    wordwrap: false,
    selectors: [
      { selector: "h1", format: "block" },
      { selector: "p", format: "block" },
    ],
    // ...
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const [carouselImages, setCarouselImages] = useState([
    HeroCarouselOne,
    HeroCarouselTwo,
    HeroCarouselThree,
  ]);

  const [selectedCarousel, setSelectedCarousel] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectedCarousel((prev) => {
        if (prev >= 2) {
          return 0;
        } else {
          return prev + 1;
        }
      });
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [selectedCarousel]);

  const workDetails = [
    {
      id: 1,
      title: "Create your campaign with ease",
      description:
        "Use BLIMP's intuitive tools to build your fundraiser. Just follow simple prompts to add your story, set a goal, and customize your page. You can edit and update anytime — your campaign grows as your story grows.",
    },
    {
      id: 2,
      title: "Share and build momentum",
      description:
        "Spread the word by sharing your campaign link. Use BLIMP's resources to engage supporters and accelerate donations.",
    },
    {
      id: 3,
      title: "Receive funds securely",
      description:
        "Add your bank details — we use trusted payment gateway like stripe and razorpay to ensure seamless disbursement within 2 business days",
    },
  ];

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <main
        style={{
          backgroundImage: `url(${supportCampaigns?.data?.data?.banner_image})`,
        }}
        className={style.heroContainer}
      >
        <div>
          <div className={style.heroContent}>
            <h1>
              {supportCampaigns?.data?.data?.campaign_name}{" "}
              <span
                style={{
                  fontSize: "2.4rem",
                  textTransform: "lowercase",
                }}
              ></span>
            </h1>

            <button
              onClick={() => {
                navigate("/start-campaign");
              }}
            >
              Get Funding
            </button>
          </div>
        </div>
      </main>

      <section className={style.impactContainer}>
        <div>
          <h2>the latest</h2>
          <div>
            {latestCampaigns?.loading ? (
              <>
                <Skeleton
                  variant="rectangular"
                  height="40rem"
                  sx={{
                    width: {
                      xs: "100%", // mobile
                      sm: "100%", // tablet
                      md: "50%", // desktop
                    },
                  }}
                />

                <Skeleton
                  variant="rectangular"
                  height="40rem"
                  sx={{
                    width: {
                      xs: "100%", // mobile
                      sm: "100%", // tablet
                      md: "50%", // desktop
                    },
                  }}
                />
              </>
            ) : (
              <>
                <img
                  src={
                    latestCampaigns?.data?.data?.latestCampaigns?.[0]
                      ?.banner_image
                  }
                  alt=""
                />

                <div>
                  <h2>
                    {
                      latestCampaigns?.data?.data?.latestCampaigns?.[0]
                        ?.campaign_name
                    }
                  </h2>
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    <p>
                      {convert(
                        latestCampaigns?.data?.data?.latestCampaigns?.[0]?.description
                          ?.replace(/\\n/g, "")
                          ?.replace(/^"(.*)"$/, "$1")
                          ?.slice(0, 500)
                          .trim(),
                        options,
                      )}{" "}
                      {"..."}
                    </p>
                  </div>

                  <ProgressBar
                    raisedAmount={
                      latestCampaigns?.data?.data?.latestCampaigns?.[0]
                        ?.raisedAmount
                    }
                    targetAmount={
                      latestCampaigns?.data?.data?.latestCampaigns?.[0]
                        ?.targetAmount
                    }
                    percentageAchieved={
                      latestCampaigns?.data?.data?.latestCampaigns?.[0]
                        ?.percentageAchieved
                    }
                    donationCount={
                      latestCampaigns?.data?.data?.latestCampaigns?.[0]
                        ?.donationInfo?.length
                    }
                    currency={
                      latestCampaigns?.data?.data?.latestCampaigns?.[0]?.country
                        ?.currency
                    }
                    symbol={
                      latestCampaigns?.data?.data?.latestCampaigns?.[0]?.country
                        ?.symbol
                    }
                  />

                  <div>
                    <button
                      onClick={() => {
                        window.scrollTo(0, 0);
                        navigate("/feature-detail", {
                          state:
                            latestCampaigns?.data?.data?.latestCampaigns?.[0],
                        });
                      }}
                    >
                      <span>View More</span>
                      <RightIcon />
                    </button>

                    <button
                      onClick={() => {

                        window.scrollTo(0, 0);
                        navigate("/checkout", { state: latestCampaigns?.data?.data?.latestCampaigns?.[0] });
                      }}
                    >
                      Donate
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className={style.impactMobileContainer}>
              <h3>
                {
                  latestCampaigns?.data?.data?.latestCampaigns?.[0]
                    ?.campaign_name
                }
              </h3>
              <button
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate("/feature-detail", {
                    state: latestCampaigns?.data?.data?.latestCampaigns?.[0],
                  });
                }}
              >
                <span>View More</span>
                <RightIcon />
              </button>
              <button
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate("/checkout");
                }}
              >
                DONATE
              </button>
            </div>

            <button
              onClick={() => {
                window.scrollTo(0, 0);
                navigate("/feature-detail", {
                  state: latestCampaigns?.data?.data?.latestCampaigns?.[0],
                });
              }}
            >
              <span>View More</span>
              <RightIcon />
            </button>
          </div>
        </div>
      </section>

      <section className={style.topCampaignsContainer}>
        <div>
          <div>
            {latestCampaigns?.loading ? (
              [0, 1].map((item) => {
                return (
                  <Skeleton
                    key={item}
                    variant="rectangular"
                    height="40rem"
                    animation={false}
                    sx={{
                      width: {
                        xs: "100%", // mobile
                        sm: "100%", // tablet
                        md: "50%", // desktop
                      },
                      bgcolor: "#1e1e1e",
                    }}
                  />
                );
              })
            ) : (
              <>
                <CampaignCard
                  bannerImage={
                    latestCampaigns?.data?.data?.latestCampaigns?.[1]
                      ?.banner_image
                  }
                  description={convert(
                    latestCampaigns?.data?.data?.latestCampaigns?.[1]?.description
                      ?.replace(/\\n/g, "")
                      ?.replace(/^"(.*)"$/, "$1"),
                    options,
                  )}
                  campaignName={
                    latestCampaigns?.data?.data?.latestCampaigns?.[1]
                      ?.campaign_name
                  }
                  campaignItem={
                    latestCampaigns?.data?.data?.latestCampaigns?.[1]
                  }
                />
                <CampaignCard
                  bannerImage={
                    latestCampaigns?.data?.data?.latestCampaigns?.[2]
                      ?.banner_image
                  }
                  description={convert(
                    latestCampaigns?.data?.data?.latestCampaigns?.[2]?.description
                      .replace(/\\n/g, "")
                      ?.replace(/^"(.*)"$/, "$1"),
                    options,
                  )}
                  campaignName={
                    latestCampaigns?.data?.data?.latestCampaigns?.[2]
                      ?.campaign_name
                  }
                  campaignItem={
                    latestCampaigns?.data?.data?.latestCampaigns?.[2]
                  }
                />
              </>
            )}
          </div>
        </div>
      </section>

      <section className={style.heroCarouselContainer}>
        <div>
          <div>
            {carouselImages.map((item, index) => {
              return (
                <img
                  src={item}
                  key={index}
                  style={{
                    transform: `translateX(-${selectedCarousel * 100}%)`,
                  }}
                />
              );
            })}
          </div>

          <div>
            {workDetails.map((item, index) => (
              <div className={style.crowdHeadItem} key={item.id}>
                <div
                  style={{
                    border:
                      selectedCarousel === index ? "2px solid black" : "none",
                  }}
                >
                  <p>{item.id}</p>
                </div>
                <div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={style.featureContainer}>
        <div>
          <h2>Featured</h2>

          <div className={style.featureCardContainer}>
            {featuredCampaigns?.loading
              ? [0, 1, 2, 3, 4, 5].map((item) => {
                  return (
                    <Skeleton
                      key={item}
                      variant="rectangular"
                      height={"40rem"}
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
              : allFeatureItems?.map((item) => {
                  return <FeatureCard key={item.id} featureItem={item} />;
                })}
          </div>

          <div className={style.featureCardMobileContainer}>
            {featuredCampaigns?.loading
              ? [0, 1, 2, 3, 4, 5].map((item) => {
                  return (
                    <Skeleton
                      key={item}
                      variant="rectangular"
                      height={"40rem"}
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
              : allFeatureItems?.map((item) => {
                  return <FeatureCardMobile key={item.id} featureItem={item} />;
                })}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pagination
              count={totalPages}
              size="large"
              sx={{
                "& .MuiPaginationItem-page": {
                  fontSize: "1.4rem",
                },
              }}
              value={page}
              onChange={handlePageChange}
              disabled={featuredCampaigns?.loading}
            />
          </div>
        </div>
      </section>

      <section className={style.newsContainer}>
        <div>
          <h2>News</h2>
          <div>
            {latestArticles.loading ? (
              <Skeleton
                variant="rectangular"
                // width={"50%"}
                height={"50rem"}
                sx={{
                  width: {
                    xs: "0%", // mobile
                    sm: "100%", // tablet
                    md: "50%", // desktop
                  },
                }}
                // sx={{ bgcolor: "black" }}
              />
            ) : (
              <img
                src={latestArticles?.data?.data?.latestArticle?.image}
                alt=""
              />
            )}

            <div>
              {latestArticles.loading
                ? [0, 1, 2, 3].map((item) => {
                    return (
                      <Skeleton
                        key={item}
                        variant="rectangular"
                        width={"100%"}
                        height={"9.6rem"}
                        // sx={{ bgcolor: "black" }}
                      />
                    );
                  })
                : latestArticles?.data?.data?.nextArticles?.map(
                    (item, index) => {
                      return (
                        <NewsCard
                          index={index}
                          key={item.id}
                          articleItem={item}
                        />
                      );
                    },
                  )}
            </div>
          </div>
        </div>
      </section>

      <section
        ref={ref}
        style={{
          transform: isVisible ? "scale(1)" : "scale(0.92)",
          opacity: isVisible ? 1 : 0,
          borderRadius: isVisible ? "0rem" : "2rem",
          boxShadow: isVisible
            ? "0 20px 40px rgba(0,0,0,0.1)"
            : "0 10px 20px rgba(0,0,0,0)",
          transition:
            "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s ease, border-radius 0.8s ease, box-shadow 0.8s ease",
        }}
        className={style.blimp_content_container}
      >
        <div>
          <h2>Blimp has your back.</h2>
          <p>
            Fundraising on Blimp is simple, secure, and built on trust. Whether
            you're raising money for yourself, friends, family, or a cause close
            to your heart, Blimp provides everything you need to succeed.
          </p>
          <p>
            With transparent pricing, reliable safety checks, and an easy-to-use
            platform, Blimp removes the stress from fundraising and giving. From
            personal emergencies to community initiatives, we're here to help
            you raise funds or contribute with confidence and peace of mind.
          </p>
          <p>
            Need help along the way? Our support resources are always available
            to guide you through every step of your journey.
          </p>
        </div>
      </section>
    </>
  );
};

export default Hero;
