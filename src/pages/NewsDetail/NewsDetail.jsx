import React, { useEffect, useRef, useState } from "react";
import style from "./NewsDetail.module.css";
import BlogCard from "../../components/BlogCard/BlogCard";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api";
import Skeleton from "@mui/material/Skeleton";

const NewsDetail = () => {
  const location = useLocation();
  const { state: newsItem } = location;

  // console.log(newsItem);

  const navigate = useNavigate();

  const [newsDetailItem, setNewsDetailItem] = useState({
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
    const fetchNewsDetailItem = async () => {
      setNewsDetailItem((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.post("/get-articles-details", {
          article_id: newsItem.id,
        });
        if (data.code === 200) {
          setNewsDetailItem({ loading: false, error: null, data });
        } else if (data.code === 400) {
          setNewsDetailItem({ loading: false, error: data.message, data: {} });
        }
      } catch (error) {
        setNewsDetailItem({ loading: false, error: error.message, data: {} });
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

    fetchNewsDetailItem();
    fetchLatestArticles();
  }, []);

  const [showStickyDonate, setShowStickyDonate] = useState(false);
  const donateTriggerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!donateTriggerRef.current) return;

      const triggerPoint =
        donateTriggerRef.current.getBoundingClientRect().bottom;

      // Show sticky button once original donate button scrolls out
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
      <section className={style.newsDetailContainer}>
        <div>
          {newsDetailItem?.loading ? (
            <Skeleton variant="rectangular" width={"100%"} height={"4rem"} />
          ) : (
            <h2>{newsDetailItem?.data?.data?.title}</h2>
          )}

          {newsDetailItem?.loading ? (
            <Skeleton variant="rectangular" width={"100%"} height={"56rem"} />
          ) : (
            <img src={newsDetailItem?.data?.data?.image} alt="" />
          )}

          <div>
            <h2>Description</h2>
            <p>{newsDetailItem?.data?.data?.description}</p>
          </div>

          <button ref={donateTriggerRef} onClick={() => navigate("/checkout")}>
            donate now
          </button>

          <div className={style.addsContainer}>
            <h2>Run Ads / Causes section</h2>
          </div>
        </div>
      </section>

      <section className={style.blogsContainer}>
        <div>
          <div>
            <h2>latest news and blog</h2>
            <button
              onClick={() => {
                window.scrollTo(0, 0);
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
            onClick={() => navigate("/checkout")}
          >
            Donate Now
          </button>
        </div>
      )}
    </main>
  );
};

export default NewsDetail;
