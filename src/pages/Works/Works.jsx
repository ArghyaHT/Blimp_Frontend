import React, { useEffect, useState } from "react";
import style from "./Works.module.css";
import BlogCard from "../../components/BlogCard/BlogCard";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import Skeleton from "@mui/material/Skeleton";

const Works = () => {
  const navigate = useNavigate();

  const [latestArticles, setLatestArticles] = useState({
    loading: false,
    error: null,
    data: {},
  });

  useEffect(() => {
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

    fetchLatestArticles();
  }, []);

  const workDetails = [
    {
      id: 1,
      title: "Define Your Dream",
      description:
        "Start with why.What are you creating, and why does it matter?A strong story is the foundation of every successful campaign.🧠 BLIMP Tip: Be real and relatable — people don't just fund projects, they fund people with passion and purpose.",
    },
    {
      id: 2,
      title: "Set a Clear Goal",
      description:
        "Decide how much you need and what it will cover. Break it down simply for transparency (production, materials, logistics etc.). We let you keep whatever you raised. Update your progress timely for the campaign to gain traction.💬 BLIMP Tip: A realistic target builds trust and encourages more people to jump onboard early.",
    },
    {
      id: 3,
      title: "Tell Your Story",
      description:
        "Your story is important. Do what counts the most: use visuals, videos, and words that show your personality and mission.Explain how support makes a difference and invite people to join your journey.📹 BLIMP Tip: A 2–3 minute great quality video with your face and voice goes a long way — authenticity beats perfection!",
    },
    {
      id: 4,
      title: "Share and Engage",
      description:
        "Once your campaign goes live, it's time to spread the word!\n- Share regular updates on social media.\n- Ask friends, family, and early supporters to help share your campaign.\n- Celebrate milestones and thank your backers often.\n\n💬 BLIMP Tip: Energy is contagious! The more excited you are, the more people will want to join your movement.",
    },
    {
      id: 5,
      title: "Deliver, Update, and Celebrate",
      description:
        "You did it! Your campaign took flight. 🎈Now it's time to deliver on your promises — and keep the community you've built.",
    },
  ];

  return (
    <main>
      <section className={style.crowdFundContainer}>
        <h2>Our guide to crowdfunding</h2>
      </section>

      <section className={style.crowdHeaderContainer}>
        <div>
          <div>
            <img
              src="https://www.rescue.org/sites/default/files/styles/square_1x1_1280px_wide/public/2025-06/GettyImages-2184690593.jpg?itok=vEWo37NF"
              alt=""
            />
          </div>

          <div>
            {workDetails.map((item, index) => (
              <div className={style.crowdHeadItem} key={item.id}>
                <div>
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
              more news
            </button>
          </div>

          <div className={style.blogCardContainer}>
            {latestArticles.loading
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
              : (
                  latestArticles?.data?.data?.remainingArticles?.length > 0
                    ? latestArticles?.data?.data?.remainingArticles
                    : latestArticles?.data?.data?.nextArticles?.length > 0
                    ? latestArticles?.data?.data?.nextArticles
                    : latestArticles?.data?.data?.latestArticle
                    ? [latestArticles.data.data.latestArticle]
                    : []
                )
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

          <button
            onClick={() => {
              window.scrollTo(0, 0);
              navigate("/news-blog");
            }}
          >
            more news
          </button>
        </div>
      </section>
    </main>
  );
};

export default Works;
