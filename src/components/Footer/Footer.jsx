import React, { useState } from "react";
import styles from "./Footer.module.css";
import blimpLogo from "../../assets/BlimpLogo1.png";
import { FacebookIcon, InstagramIcon, TwitterXIcon } from "../../icons";
import toast from "react-hot-toast";
import { toastStyle } from "../../utils/toastStyles";
import api from "../../api/api";
import { ClipLoader } from "react-spinners";

const Footer = () => {
  const menus = [
    {
      name: "How it Works",
      link: "/works",
    },
    {
      name: "Team",
      link: "/aboutus",
    },
    {
      name: "Privacy Policy",
      link: "#",
    },
    {
      name: "FAQ",
      link: "/contact-us",
    },
    {
      name: "Terms & Conditions",
      link: "#",
    },
  ];

  const [subscribeEmail, setSubscribeEmail] = useState("");

  const [subscribeNewsLetters, setSubscribeNewsLetters] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!subscribeEmail) {
      toast.error("Please enter an email", {
        duration: 3000,
        style: toastStyle,
      });
      return;
    } else if (!emailRegex.test(subscribeEmail)) {
      toast.error("Please enter a valid email", {
        duration: 3000,
        style: toastStyle,
      });
      return;
    }

    try {
      setSubscribeNewsLetters((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      const { data } = await api.post("/subscribeNewsLetters", {
        email: subscribeEmail,
      });

      if (data?.code === 400) {
        setSubscribeNewsLetters({
          loading: false,
          error: data.message,
          data: {},
        });
        return;
      }

      setSubscribeNewsLetters({ loading: false, error: null, data });

      toast.success(data.message, { duration: 3000, style: toastStyle });
      setSubscribeEmail("");
    } catch (error) {
      setSubscribeNewsLetters({
        loading: false,
        error: error.message,
        data: {},
      });
    }
  };

  return (
    <>
      <footer className={styles.footer}>
        <div>
          <div>
            <div>
              <h2>
                One email. One story. Every week. Sign up for the Blimp
                newsletter.
              </h2>
              <div>
                <input
                  type="text"
                  placeholder="Enter Email"
                  value={subscribeEmail}
                  onChange={(e) => {
                    setSubscribeEmail(e.target.value);
                  }}
                />
                <button
                  disabled={subscribeNewsLetters?.loading}
                  onClick={handleSubscribe}
                >
                  {subscribeNewsLetters?.loading ? (
                    <ClipLoader
                      size={"3rem"}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                      color="#fff"
                    />
                  ) : (
                    "subscribe"
                  )}
                </button>
              </div>
            </div>

            <div className={styles.linkContainer}>
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
              </div>

              <div>
                <p>Eng</p>
              </div>
            </div>
          </div>

          <i
            style={{
              color: "#fff",
              fontSize: "var(--font-vsmall)",
            }}
          >
            By signing up, you agree to the <span>Terms of Use</span> and{" "}
            <span>Privacy Policy</span> & to receive electronic communications
            from VICE Media Group, which may include marketing promotions,
            advertisements and sponsored content.
          </i>

          <div>
            <img src={blimpLogo} alt="Blimp Company Logo" width={100} />
          </div>

          <div className={styles.menuContainer}>
            {menus.map((item) => {
              return (
                <a href={item?.link} key={item.name}>
                  {item.name}
                </a>
              );
            })}
          </div>
        </div>
      </footer>
      <div className={styles.copyrightContainer}>
        <p>Copyright @ 2024. All Rights Reserved</p>
      </div>
    </>
  );
};

export default Footer;
