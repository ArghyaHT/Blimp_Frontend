import React, { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./protected/ProtectedRoute";
import ProtectedAuthRoute from "./protected/ProtectedAuthRoute";
const Layout = lazy(() => import("./Layout/Layout"));
const Hero = lazy(() => import("./pages/Hero/Hero"));
const AboutUs = lazy(() => import("./pages/AboutUs/AboutUs"));
const HowItWorks = lazy(() => import("./pages/Works/Works"));
const ContactUs = lazy(() => import("./pages/ContactUs/ContactUs"));
const Discover = lazy(() => import("./pages/Discover/Discover"));
const NewsDetail = lazy(() => import("./pages/NewsDetail/NewsDetail"));
const FeatureDetail = lazy(() => import("./pages/FeatureDetail/FeatureDetail"));
const CheckOutPage = lazy(() => import("./pages/CheckOutPage/CheckOutPage"));
const NewsBlogPage = lazy(() => import("./pages/NewsBlogPage/NewsBlogPage"));
const LoginSignup = lazy(() => import("./pages/LoginSignup/LoginSignup"));
const ForgetPassword = lazy(() => import("./pages/ForgetPassword/ForgetPassword"))
const ForgetChangedPassword = lazy(() => import("./pages/ForgetChangedPassword/ForgetChangedPassword"))

const Account = lazy(() => import("./pages/Account/Account"));
const Profile = lazy(() => import("./pages/Account/Profile/Profile"));
const ActiveCampaigns = lazy(() =>
  import("./pages/Account/ActiveCampaigns/ActiveCampaigns")
);
const DraftCampaigns = lazy(() =>
  import("./pages/Account/DraftCampaigns/DraftCampaigns")
);
const StoppedCampaigns = lazy(() =>
  import("./pages/Account/StoppedCampaigns/StoppedCampaigns")
);
const DonationHistory = lazy(() =>
  import("./pages/Account/DonationHistory/DonationHistory")
);
const BankAccount = lazy(() =>
  import("./pages/Account/BankAccount/BankAccount")
);
const KYC = lazy(() => import("./pages/Account/KYC/KYC"));
const ChangePassword = lazy(() =>
  import("./pages/Account/ChangePassword/ChangePassword")
);
const CampaignUpdates = lazy(() =>
  import("./pages/Account/CampaignUpdates/CampaignUpdates")
);
const StartCampaign = lazy(() => import("./pages/StartCampaign/StartCampaign"));
const EditCampaign = lazy(() => import("./pages/EditCampaign/EditCampaign"));
const Cause = lazy(() => import("./pages/Cause/Cause"));

const App = () => {
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      p, h1, h2, h3, h4, h5, i, a, input, textarea, input::placeholder, textarea::placeholder, select, label {
        color: var(--text-primary);
      }

      p {
        font-size: 1.6rem;
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="loading-wrapper">
              <div className="loading">
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
            </div>
          }
        >
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Hero />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/works" element={<HowItWorks />} />
              <Route path="/contact-us" element={<ContactUs />} />

              <Route path="/discover" element={<Discover />} />

              <Route path="/news-detail" element={<NewsDetail />} />
              <Route path="/feature-detail" element={<FeatureDetail />} />

              <Route path="/checkout" element={<CheckOutPage />} />
              <Route path="/news-blog" element={<NewsBlogPage />} />
              <Route path="/start-campaign" element={<StartCampaign />} />

              <Route element={<ProtectedAuthRoute />}>
                <Route path="/login-signup" element={<LoginSignup />} />
                <Route path="/forget-password" element={<ForgetPassword />} />
                <Route path="/forget-changepassword" element={<ForgetChangedPassword />} />
              </Route>

              {/* Account Page with Nested Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/account" element={<Account />}>
                  <Route index element={<Profile />} />
                  <Route
                    path="active-campaigns"
                    element={<ActiveCampaigns />}
                  />
                  <Route path="draft-campaigns" element={<DraftCampaigns />} />
                  <Route
                    path="stopped-campaigns"
                    element={<StoppedCampaigns />}
                  />
                  <Route
                    path="donation-history"
                    element={<DonationHistory />}
                  />
                  <Route path="bank-account" element={<BankAccount />} />
                  <Route
                    path="campaign-updates"
                    element={<CampaignUpdates />}
                  />
                  {/* <Route path="kyc-document" element={<KYC />} /> */}
                  <Route path="change-password" element={<ChangePassword />} />
                </Route>

                <Route path="/edit-campaign" element={<EditCampaign />} />
                <Route path="/cause" element={<Cause />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
};

export default App;
