import React, { useEffect, useState } from "react";
import style from "./Discover.module.css";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import FeatureCard from "../../components/FeatureCard/FeatureCard";
import {
  AnimalIcon,
  CommunityIcon,
  EducationIcon,
  EmergencyIcon,
  EnvironmentIcon,
  EventIcon,
  FaithIcon,
  FamilyIcon,
  FlimIcon,
  MedicalIcon,
  MemorialIcon,
  NonProfitIcon,
  SearchIcon,
  SportIcon,
  WishIcon,
} from "../../icons";
import api from "../../api/api";
import Skeleton from "@mui/material/Skeleton";
import { useAuth } from "../../context/AuthContext";

const Discover = () => {
  const { user } = useAuth();

  const [campaignHistoryList, setCampaignHistoryList] = useState([]);
  const [campaignHistoryCopyList, setCampaignHistoryCopyList] = useState([]);
  const [campaignHistoryLoading, setCampaignHistoryLoading] = useState(false);

  const sortCardData = [
    { id: 1, icon: <MedicalIcon />, label: "Medical" },
    { id: 2, icon: <SportIcon />, label: "Sports" },
    { id: 3, icon: <NonProfitIcon />, label: "Non Profit" },
    { id: 4, icon: <EducationIcon />, label: "Education" },
    { id: 5, icon: <AnimalIcon />, label: "Animal" },
    { id: 6, icon: <EnvironmentIcon />, label: "Environment" },
    { id: 7, icon: <FlimIcon />, label: "Art & Film" },
    { id: 8, icon: <FaithIcon />, label: "Faith" },
    { id: 9, icon: <WishIcon />, label: "Wishes" },
    { id: 10, icon: <MemorialIcon />, label: "Memorial" },
  ];

  const [getCategories, setGetCategories] = useState([]);
  const [getCategoriesLoading, setGetCategoriesLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetch_categories = async () => {
      try {
        setGetCategoriesLoading(true);

        const { data } = await api.post("/get-category");
        setGetCategories(data?.data);
      } catch (error) {
        console.log(error);
      } finally {
        setGetCategoriesLoading(false);
      }
    };

    fetch_categories();
  }, []);

  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchCampaignHistory = async (page, selectedCategory, query) => {
    setCampaignHistoryLoading(true);
    try {
      const { data } = await api.post("/get-discover-campaign", {
        // userId: user.id,
        page,
        category_name: selectedCategory?.name,
        campaign_name: query,
      });
      if (data.code === 200) {
        setCampaignHistoryList(data?.data);
        setCampaignHistoryCopyList(data?.data);
        setTotalPages(data?.pagination?.totalPages);
      } else if (data.code === 400) {
        setCampaignHistoryList([]);
        setCampaignHistoryCopyList([]);
      }
    } catch (error) {
      setCampaignHistoryList([]);
    } finally {
      setCampaignHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && page) {
      fetchCampaignHistory(page, selectedCategory, query);
    }
  }, [user, page, selectedCategory, query]);

  // Pagination logic

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  return (
    <main>
      <section className={style.discoverSortContainer}>
        <div>
          <div>
            <div>
              <h2>Discover</h2>
            </div>

            <div>
              <input
                type="text"
                placeholder="Search by title or country"
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setSelectedCategory("");
                  setQuery(e.target.value);
                }}
              />
              <button>
                <SearchIcon />
              </button>
            </div>
          </div>

          <div>
            {getCategoriesLoading
              ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => {
                return (
                  <Skeleton
                    key={item}
                    variant="rectangular"
                    height={"20.5rem"}
                    sx={{
                      width: {
                        xs: "100%", // mobile
                        sm: "100%", // tablet
                        md: "17%", // desktop
                      },
                    }}
                  />
                );
              })
              : getCategories?.map((item) => {
                const categoryItem = sortCardData.find(
                  (cat) => cat.label === item?.name
                );
                return (
                  <button
                    key={item?.label}
                    className={style.sortCardItem}
                    onClick={() => {
                      setPage(1);
                      setQuery("");
                      setSelectedCategory((prev) => {
                        if (prev.name === item.name) {
                          return "";
                        } else {
                          return item;
                        }
                      });
                    }}
                    style={{
                      border:
                        selectedCategory?.name === item?.name
                          ? "0.2rem solid var(--text-primary)"
                          : "none",
                    }}
                  >
                    <div>
                      <div>{categoryItem?.icon}</div>
                      <p>{item?.name}</p>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </section>

      <section className={style.featureContainer}>
        <div>
          <div className={style.featureCardContainer}>
            {campaignHistoryLoading ? (
              [0, 1, 2, 3, 4, 5].map((item) => {
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
            ) : campaignHistoryCopyList?.length > 0 ? (
              campaignHistoryCopyList?.map((item) => (
                <FeatureCard key={item.id} featureItem={item} />
              ))
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "20rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <p>No campaigns available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pagination */}
      <section className={style.paginationContainer}>
        <Stack spacing={2} direction="row" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            disabled={campaignHistoryLoading}
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1.4rem",
              },
            }}
          />
        </Stack>
      </section>
    </main>
  );
};

export default Discover;
