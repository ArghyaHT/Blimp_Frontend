import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Skeleton from "@mui/material/Skeleton";
import FeatureCard from "../../components/FeatureCard/FeatureCard";
import FeatureCardMobile from "../../components/FeatureCardMobile/FeatureCardMobile";
import api from "../../api/api";
import style from "./CountryCampaigns.module.css";

const toSlug = (name = "") =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const CountryCampaigns = () => {
  const { countrySlug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [totalCount, setTotalCount] = useState(0);

  const [country, setCountry] = useState(
    location.state?.country && toSlug(location.state.country.name) === countrySlug
      ? location.state.country
      : null
  );
  const [countryNotFound, setCountryNotFound] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Resolve country from slug (for direct URL visits / refresh)
  useEffect(() => {
    setPage(1);
    setCountryNotFound(false);
    if (
      location.state?.country &&
      toSlug(location.state.country.name) === countrySlug
    ) {
      setCountry(location.state.country);
      return;
    }
    const resolveCountry = async () => {
      try {
        setLoading(true);
        const { data } = await api.post("/get-countries");
        const found = (data?.data || []).find(
          (c) => toSlug(c?.name) === countrySlug
        );
        if (found) setCountry(found);
        else {
          setCountry(null);
          setCountryNotFound(true);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setCountryNotFound(true);
        setLoading(false);
      }
    };
    resolveCountry();
  }, [countrySlug]);

  useEffect(() => {
    if (!country?.id) return;
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const { data } = await api.post("/get-discover-campaign", {
          page,
          country_id: country.id,
        });
        if (data.code === 200) {
          setCampaigns(data?.data || []);
          setTotalPages(data?.pagination?.totalPages || 0);
          setTotalCount(data?.pagination?.total || 0);
        } else {
          setCampaigns([]);
          setTotalPages(0);
          setTotalCount(0);
        }
      } catch (error) {
        setCampaigns([]);
        setTotalPages(0);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, [country?.id, page]);

  useEffect(() => {
    if (country?.name) document.title = `Campaigns in ${country.name} | Blimp`;
  }, [country?.name]);

  const skeletons = [0, 1, 2, 3, 4, 5];

  const emptyState = (
    <div className={style.empty}>
      <h2>
        {countryNotFound
          ? "We couldn't find that country"
          : "No campaigns here yet"}
      </h2>
      <p>
        {countryNotFound
          ? "The link may be broken or the country isn't supported."
          : "Check back soon, or explore campaigns from around the world."}
      </p>
      <button
        className="btn-3d btn-3d--secondary"
        onClick={() => navigate("/discover")}
      >
        <span>Explore campaigns</span>
      </button>
    </div>
  );

  return (
    <main className={style.page}>
      <section className={style.header}>
        <div className={style.headerInner}>
          <h1 className={style.title}>
            {country?.name
              ? `Campaigns in ${country.name}`
              : countryNotFound
                ? "Country not found"
                : "Loading..."}
          </h1>

          {/* {!loading && totalCount > 0 && (
            <p className={style.count}>
              {totalCount} campaign{totalCount === 1 ? "" : "s"}
            </p>
          )} */}
        </div>
      </section>

      <section className={style.content}>
        <div>
          {/* Desktop grid */}
          <div className={style.desktopGrid}>
            {loading
              ? skeletons.map((item) => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  height={"40rem"}
                  sx={{ width: { xs: "100%", sm: "48%", md: "32%" }, borderRadius: "1.2rem" }}
                />
              ))
              : campaigns.length > 0
                ? campaigns.map((item) => (
                  <FeatureCard key={item.id} featureItem={item} />
                ))
                : emptyState}
          </div>

          {/* Mobile / tablet list */}
          <div className={style.mobileList}>
            {loading
              ? skeletons.slice(0, 4).map((item) => (
                <Skeleton
                  key={item}
                  variant="rectangular"
                  height={"14rem"}
                  sx={{ width: "100%", borderRadius: "1.2rem" }}
                />
              ))
              : campaigns.length > 0
                ? campaigns.map((item) => (
                  <FeatureCardMobile key={item.id} featureItem={item} />
                ))
                : emptyState}
          </div>

          {totalPages > 1 && (
            <div className={style.pagination}>
              <Stack spacing={2} direction="row" justifyContent="center">
                <Pagination
                  count={totalPages}
                  page={page}
                  siblingCount={0}
                  onChange={(e, value) => {
                    setPage(value);
                    window.scrollTo(0, 0);
                  }}
                  disabled={loading}
                  sx={{ "& .MuiPaginationItem-root": { fontSize: "1.4rem" } }}
                />
              </Stack>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default CountryCampaigns;
