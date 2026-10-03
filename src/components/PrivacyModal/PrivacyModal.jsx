import React, { useEffect, useState } from "react";
import style from "./PrivacyModal.module.css";

const PrivacyModal = () => {
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [showFullPolicyModal, setShowFullPolicyModal] = useState(false);
  const [modalType, setModalType] = useState("privacy"); // "privacy" | "terms" | "cookies"

  useEffect(() => {
    // Check if consent has already been accepted in localStorage
    const consentAccepted = localStorage.getItem("blimp_privacy_consent");
    if (!consentAccepted) {
      setShowConsentBanner(true);
    }

    // Listen for custom events to open policy modals anytime (e.g. from footer links)
    const handleOpenPrivacy = (e) => {
      setModalType(e?.detail?.type || "privacy");
      setShowFullPolicyModal(true);
    };

    window.addEventListener("open-privacy-policy", handleOpenPrivacy);
    return () => window.removeEventListener("open-privacy-policy", handleOpenPrivacy);
  }, []);

  const handleAcceptConsent = () => {
    localStorage.setItem("blimp_privacy_consent", "accepted");
    setShowConsentBanner(false);
  };

  const openFullNotice = (type = "privacy") => {
    setModalType(type);
    setShowFullPolicyModal(true);
  };

  return (
    <>
      {/* Floating Consent Card (Pixel-perfect matching user's screenshot) */}
      {showConsentBanner && (
        <div className={style.privacyCardOverlay}>
          <div className={style.privacyCard}>
            <h3 className={style.privacyTitle}>Privacy Information</h3>

            <p className={style.privacyText}>
              We and our vendors use cookies and similar technologies that analyze
              how you use our site to help people help each other, save your
              preferences, provide you with a meaningful experience, and assist in
              our marketing efforts. By staying on this site or clicking "Okay", you
              consent to the use of these technologies as explained in our{" "}
              <span
                className={style.privacyLink}
                onClick={() => openFullNotice("privacy")}
              >
                Privacy Notice
              </span>{" "}
              and{" "}
              <span
                className={style.privacyLink}
                onClick={() => openFullNotice("cookies")}
              >
                Cookie Policy
              </span>
              , and agree to our{" "}
              <span
                className={style.privacyLink}
                onClick={() => openFullNotice("terms")}
              >
                Terms of Service
              </span>
              .
            </p>

            <button className={style.okayBtn} onClick={handleAcceptConsent}>
              Okay
            </button>

            <div className={style.privacyFooterRow}>
              <button
                className={style.iconBtn}
                title="Cookie Settings"
                onClick={() => openFullNotice("cookies")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>

              <button
                className={style.privacyFooterLink}
                onClick={() => openFullNotice("privacy")}
              >
                See Our Privacy Notice
              </button>

              <button
                className={style.iconBtn}
                title="Language Options"
                onClick={() => openFullNotice("privacy")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m5 8 6 6"></path>
                  <path d="m4 14 6-6 2-3"></path>
                  <path d="M2 5h12"></path>
                  <path d="M7 2h1"></path>
                  <path d="m22 22-5-10-5 10"></path>
                  <path d="M14 18h6"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Privacy Notice & Terms Modal View */}
      {showFullPolicyModal && (
        <div
          className={style.fullModalOverlay}
          onClick={() => setShowFullPolicyModal(false)}
        >
          <div
            className={style.fullModalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={style.fullModalHeader}>
              <h2>
                {modalType === "terms"
                  ? "Terms of Service"
                  : modalType === "cookies"
                  ? "Cookie Policy"
                  : "Privacy Notice"}
              </h2>
              <button
                className={style.closeBtn}
                onClick={() => setShowFullPolicyModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={style.fullModalBody}>
              {modalType === "terms" ? (
                <>
                  <p>
                    Welcome to BLIMP. By accessing or using our platform, services,
                    and features, you agree to be bound by these Terms of Service.
                  </p>
                  <h3>1. User Responsibilities</h3>
                  <p>
                    You agree to use BLIMP only for lawful crowdfunding, donation,
                    and fundraising purposes. All campaign information published must
                    be truthful and accurate.
                  </p>
                  <h3>2. Payments & Donations</h3>
                  <p>
                    Donations made on BLIMP are voluntary. Payments are processed via
                    secure third-party payment gateways.
                  </p>
                </>
              ) : modalType === "cookies" ? (
                <>
                  <p>
                    BLIMP uses cookies and tracking technologies to optimize site performance,
                    personalize user experiences, and analyze traffic.
                  </p>
                  <h3>Essential Cookies</h3>
                  <p>Required for login authentication and navigation functionality.</p>
                  <h3>Analytics Cookies</h3>
                  <p>Help us analyze how users interact with campaign pages to improve user experience.</p>
                </>
              ) : (
                <>
                  <p>
                    At BLIMP, we respect your privacy and are committed to protecting your personal data.
                    This Privacy Notice explains how we collect, use, and share information.
                  </p>
                  <h3>1. Information We Collect</h3>
                  <p>
                    We collect personal information such as your name, email address, payment details, and
                    campaign history when you register or make a donation.
                  </p>
                  <h3>2. How We Use Your Information</h3>
                  <p>
                    Your data is used to facilitate campaign donations, process transactions, prevent fraud,
                    and send important updates about your account.
                  </p>
                  <h3>3. Data Protection & Security</h3>
                  <p>
                    We implement industry-standard encryption and security measures to protect your information against unauthorized access.
                  </p>
                </>
              )}
            </div>

            <div className={style.fullModalFooter}>
              <button
                className="glossy-btn"
                style={{ paddingInline: "3rem", height: "4rem" }}
                onClick={() => setShowFullPolicyModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrivacyModal;
