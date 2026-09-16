import React, { useState, } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import style from "./CheckOutPage.module.css";
import {
  CreditCardIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterXIcon,
  WhatsappIcon,
} from "../../icons";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import Switch from "react-switch";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";

const CheckOutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState("Give Once");
  const [openCustomTipInput, setOpenCustomTipInput] = useState(false);

  const [donationCheck, setDonationCheck] = useState(false);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");

  const [firstnameError, setFirstnameError] = useState("");
  const [lastnameError, setLastnameError] = useState("");
  const [personalEmailError, setPersonalEmailError] = useState("");

  const [value, setValue] = useState([0, 0]);

  // ------------------------------------
  // DONATION AMOUNT
  // ------------------------------------

  const donationAmounts = [25, 50, 100, 500, 1000];

  const [donationAmount, setDonationAmount] = useState(1000);

  // ------------------------------------
  // CUSTOM TIP
  // ------------------------------------

  const [customTip, setCustomTip] = useState("");


  const location = useLocation();

  const campaign = location.state;

  console.log(campaign, "campaign in checkout page");

  // ------------------------------------
  // CALCULATE TIP
  // ------------------------------------

  const tipPercentage = Number(value[1]) || 0;

  const percentageTip =
    (Number(donationAmount) * tipPercentage) / 100;

  const customTipAmount =
    customTip !== "" && !isNaN(Number(customTip))
      ? Number(customTip)
      : 0;

  const tipAmount =
    customTip !== ""
      ? customTipAmount
      : percentageTip;

  const totalAmount =
    Number(donationAmount) + Number(tipAmount);

  // ------------------------------------
  // FORMAT CURRENCY
  // ------------------------------------

  const formatCurrency = (amount) => {
    return `${campaign.country.symbol}${Number(amount).toFixed(2)}`;
  };

  // ------------------------------------
  // SELECT DONATION
  // ------------------------------------

  const handleDonationAmount = (amount) => {
    setDonationAmount(amount);
  };

  // ------------------------------------
  // CUSTOM TIP
  // ------------------------------------

  const handleCustomTipChange = (e) => {
    const inputValue = e.target.value;

    if (/^\d*\.?\d*$/.test(inputValue)) {
      setCustomTip(inputValue);

      if (inputValue !== "") {
        setValue([0, 0]);
      }
    }
  };

  // ------------------------------------
  // DONATE
  // ------------------------------------

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const verifyDonation = async (paymentResponse) => {
    try {
      const verifyData = {
        campaign_id: campaign.id,
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      };

      console.log("Verify Payment Data:", verifyData);

      const response = await api.post("/verifyDonation", verifyData);
      const result = response.data;

      console.log("Verify Donation Response:", result);

      if (result?.code === 200) {
        alert("Donation successful!");
        window.scrollTo(0, 0);
        navigate("/");
      } else {
        alert(result?.message || "Payment verification failed. If money was deducted, status will update shortly.");
      }
    } catch (error) {
      console.error("Payment Verification Error:", error);
      alert(
        error.response?.data?.message ||
          "Payment verification process had an issue. If money was deducted, your donation status will update automatically."
      );
    }
  };

  // const handleDonate = async () => {

  //   let valid = true;

  //   setFirstnameError("");
  //   setLastnameError("");
  //   setPersonalEmailError("");

  //   if (!firstname.trim()) {
  //     setFirstnameError("First name is required");
  //     valid = false;
  //   }

  //   if (!lastname.trim()) {
  //     setLastnameError("Last name is required");
  //     valid = false;
  //   }

  //   if (!personalEmail.trim()) {
  //     setPersonalEmailError("Email is required");
  //     valid = false;
  //   } else if (
  //     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)
  //   ) {
  //     setPersonalEmailError("Please enter a valid email");
  //     valid = false;
  //   }

  //   if (!valid) {
  //     return;
  //   }

  //   const loaded = await loadRazorpay();

  //   if (!loaded) {
  //     alert("Razorpay SDK failed to load. Please check your internet connection.");
  //     return;
  //   }

  //   // const donationData = {
  //   //   donationType: selectedTab,
  //   //   donationAmount: donationAmount,
  //   //   tipPercentage: tipPercentage,
  //   //   tipAmount: tipAmount,
  //   //   totalAmount: totalAmount,
  //   //   anonymous: donationCheck,
  //   //   firstname: firstname,
  //   //   lastname: lastname,
  //   //   email: personalEmail,
  //   // };

  //   const donationData = {
  //     user_id: user?.id || null,
  //     campaign_id: campaign.id,

  //     total_amount: Number(totalAmount),
  //     tip_amount: Number(tipAmount),
  //     tip_percent: Number(tipPercentage),

  //     first_name: firstname.trim(),
  //     last_name: lastname.trim(),
  //     email: personalEmail.trim(),

  //     is_supporters: selectedTab === "supporters" ? 1 : 0,
  //     is_email_subscribed: 0,
  //     is_anonymous: donationCheck ? 1 : 0,
  //   };



  //   console.log("Donation Data:", donationData);

  //   // Payment API can be called here
  // };

  const handleDonate = async () => {
    let valid = true;

    setFirstnameError("");
    setLastnameError("");
    setPersonalEmailError("");

    // Only validate personal information if NOT anonymous
    if (!donationCheck) {
      if (!firstname.trim()) {
        setFirstnameError("First name is required");
        valid = false;
      }

      if (!lastname.trim()) {
        setLastnameError("Last name is required");
        valid = false;
      }

      if (!personalEmail.trim()) {
        setPersonalEmailError("Email is required");
        valid = false;
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalEmail)
      ) {
        setPersonalEmailError("Please enter a valid email");
        valid = false;
      }
    }

    if (!valid) {
      return;
    }

    try {
      // ------------------------------------
      // LOAD RAZORPAY
      // ------------------------------------

      const loaded = await loadRazorpay();

      if (!loaded) {
        alert(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
        return;
      }

      // ------------------------------------
      // DONATION DATA
      // ------------------------------------

      const campaignCurrency = campaign?.country?.currency || campaign?.country?.currency_code || "INR";

      const donationData = {
        user_id: user?.id || null,
        campaign_id: campaign.id,

        total_amount: Number(totalAmount),
        tip_amount: Number(tipAmount),
        tip_percent: Number(tipPercentage),
        currency: campaignCurrency,

        first_name: donationCheck ? "Anonymous" : firstname.trim(),
        last_name: donationCheck ? "Donor" : lastname.trim(),
        email: donationCheck ? "anonymous@blimp.org" : personalEmail.trim(),

        is_supporters: 0,
        is_email_subscribed: 0,
        is_anonymous: donationCheck ? 1 : 0,
      };

      console.log("Donation Data:", donationData);

      // ------------------------------------
      // CREATE DONATION / RAZORPAY ORDER
      // ------------------------------------

      const response = await api.post("/donation", donationData);

      const result = await response.data;

      console.log("Donation API Response:", result);

      if (result.code !== 200) {
        alert(result.message || "Unable to create donation");
        return;
      }

      // ------------------------------------
      // DONATION CREATED
      // ------------------------------------

      const donation = result.data;

      console.log("Created Donation:", donation);

      // ------------------------------------
      // OPEN RAZORPAY
      // ------------------------------------

      console.log(
        "Razorpay Key:",
        import.meta.env.VITE_RAZORPAY_KEY
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,

        // Use the original donor amount in their currency (e.g. $2100, not ₹2,00,789)
        amount: Math.round(Number(totalAmount) * 100),

        // Use the campaign's currency so donor sees USD/EUR/SGD in the checkout
        currency: campaignCurrency,

        name: "Blimp",

        description: `${campaign.campaign_name} (${campaign?.country?.symbol || "$"}${totalAmount})`,

        order_id: donation.razorpay_order_id,

        prefill: {
          name: donationCheck ? "Anonymous Donor" : `${firstname.trim()} ${lastname.trim()}`.trim(),
          email: donationCheck ? "anonymous@blimp.org" : personalEmail.trim(),
        },

        notes: {
          campaign_id: campaign.id,
          donation_id: donation.id,
        },

        handler: async function (paymentResponse) {
          console.log(
            "Razorpay Payment Response:",
            paymentResponse
          );

          await verifyDonation(paymentResponse);
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout closed");
          },
        },

        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error(
          "Razorpay payment failed:",
          response.error
        );

        alert(
          response.error?.description ||
          "Payment failed. Please try again."
        );
      });

      razorpay.open();
    } catch (error) {
      console.error("Donation Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error?.description ||
        error.message ||
        "Something went wrong while processing your donation.";

      alert(errorMessage);
    }
  };
  const remainingAmount = campaign.targetAmount - campaign.raisedAmount;

  return (
    <main>
      <section className={style.checkoutSectionContainer}>
        <div>
          <div>
            <p>{campaign.campaign_name}</p>
            <p>Still {campaign.country.symbol} {remainingAmount} to go. Help us amplify</p>
          </div>

          <div>
            {/* <img
              src="https://cdn.sanity.io/images/2ejqxsnu/production/d6965115d7edc08e1417b0a9ae13aca2117c51b0-1280x760.jpg?w=3840&q=75&fit=clip&auto=format"
              alt=""
            /> */}

            {/* <div className={style.donationContainer}>
              <p>
                Published by: <b>Arghya Ghosh</b>
              </p>

              <ProgressBar
                raisedAmount={3000}
                targetAmount={10000}
                percentageAchieved={60}
                donationCount={500000}
                currency={"dollar"}
                symbol={"$"}
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
              </div>
            </div> */}

            <div className={style.donationFormContainer}>
              <div className={style.donationTabContainer}>
                {["Give Once", "Monthly"].map((item) => {
                  return (
                    <button
                      key={item}
                      onClick={() => {
                        setSelectedTab(item);
                      }}
                      style={{
                        backgroundColor:
                          selectedTab === item
                            ? "var(--btn-base-color)"
                            : "#fff",
                        color:
                          selectedTab === item
                            ? "#000"
                            : "var(--text-primary)",
                      }}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <p>Boost your impact by giving monthly</p>

              <div>
                {donationAmounts.map((amount) => {
                  return (
                    <div
                      key={amount}
                      onClick={() => {
                        handleDonationAmount(amount);
                      }}
                      style={{
                        backgroundColor:
                          donationAmount === amount
                            ? "var(--btn-base-color)"
                            : "#fff",
                        cursor: "pointer",
                      }}
                    >
                      <p>{campaign.country.symbol}{amount}</p>
                    </div>
                  );
                })}
              </div>

              {/* <div>
                <p>{campaign.country.symbol}</p>
                <p>{Number(donationAmount).toFixed(2)}</p>
              </div> */}

              <div>
                <p>{campaign.country.symbol}</p>
                <input
                  type="text"
                  inputMode="decimal"
                  value={donationAmount}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                      setDonationAmount(value);
                    }
                  }}
                />
              </div>

              <div>
                <p>Tip Blimp Services</p>
                <p>
                  Blimp believes in empowering every organizer — with{" "}
                  <strong>0% platform fees.</strong> We run on kindness, not
                  fees. Your optional donation helps us keep this mission alive
                  and continue supporting those who create positive change.{" "}
                </p>
              </div>

              {/* 
              <RangeSlider
                className="single-thumb"
                defaultValue={[0, 50]}
                thumbsDisabled={[true, false]}
                rangeSlideDisabled={true}
              /> */}

              <div
                style={{
                  position: "relative",
                  marginBlock: "2rem",
                }}
              >
                {/* Tooltip */}
                <div
                  style={{
                    position: "absolute",
                    top: "-3.2rem",
                    left: `calc(${value[1]}% - 1.5rem)`,
                    background: "black",
                    color: "white",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "0.6rem",
                    fontSize: "1.2rem",
                    pointerEvents: "none",
                    transition: "left 0s linear",
                  }}
                >
                  {value[1]}%
                </div>

                {/* Slider */}
                <RangeSlider
                  className="single-thumb"
                  defaultValue={[0, 0]}
                  value={value}
                  onInput={(newValue) => {
                    setValue(newValue);
                    setCustomTip("");
                  }}
                  thumbsDisabled={[true, false]}
                  rangeSlideDisabled={true}
                  min={0}
                  max={50}
                />
              </div>

              <button
                onClick={() => {
                  setOpenCustomTipInput((prev) => !prev);

                  if (openCustomTipInput) {
                    setCustomTip("");
                  }
                }}
              >
                {openCustomTipInput
                  ? "Remove custom tip"
                  : "Enter custom tip"}
              </button>

              {openCustomTipInput && (
                <input
                  placeholder="Enter custom input"
                  className={style.custom_input}
                  type="text"
                  inputMode="decimal"
                  value={customTip}
                  onChange={handleCustomTipChange}
                />
              )}

              <div className={style.tip_container}>
                {tipAmount ? (
                  <p
                    style={{
                      fontWeight: "600",
                      textAlign: "center",
                      fontSize: "1.6rem",
                      width: "100%",
                    }}
                  >
                    Thank you for your generosity!
                  </p>
                ) : (
                  <>
                    <p>
                      Are you able to add a tip? Tips keep Blimp running, so
                      people like Marjolijn can get the help they need.
                    </p>

                    <div>
                      <div>
                        <div
                          onClick={() => {
                            setValue([0, 1.5]);
                            setCustomTip("");
                          }}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              tipPercentage === 1.5
                                ? "var(--btn-base-color)"
                                : "transparent",
                          }}
                        >
                          <p>1.5%</p>
                        </div>

                        <div
                          onClick={() => {
                            setValue([0, 3]);
                            setCustomTip("");
                          }}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              tipPercentage === 3
                                ? "var(--btn-base-color)"
                                : "transparent",
                          }}
                        >
                          <p>3%</p>
                        </div>

                        <div
                          onClick={() => {
                            setValue([0, 5]);
                            setCustomTip("");
                          }}
                          style={{
                            cursor: "pointer",
                            backgroundColor:
                              tipPercentage === 5
                                ? "var(--btn-base-color)"
                                : "transparent",
                          }}
                        >
                          <p>5%</p>
                        </div>
                      </div>

                      <p>
                        Your tip: {formatCurrency(tipAmount)}
                      </p>
                    </div>
                  </>
                )}

                {tipAmount > 0 && (
                  <div className={style.selectedTip}>
                    <p>Your tip</p>
                    <p>{formatCurrency(tipAmount)}</p>
                  </div>
                )}
              </div>

              <div className={style.donation_header}>
                <div>
                  <Switch
                    width={40}
                    height={20}
                    handleDiameter={14}
                    offColor="#97A5B4"
                    onColor="#0A84FF"
                    checked={donationCheck}
                    onChange={() => {
                      setDonationCheck((prev) => !prev);
                    }}
                  />

                  <p>Donate Anonymously</p>
                </div>

                <p>
                  Turn on to keep your identity private on the fundraiser
                </p>
              </div>

              <div className={style.personal_info_container}>
                <p>Personal Information</p>

                <div>
                  <label>First Name</label>

                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstname}
                    onChange={(e) => {
                      setFirstname(e.target.value);

                      if (firstnameError) {
                        setFirstnameError("");
                      }
                    }}
                  />

                  {firstnameError && (
                    <p className="input-error-message">
                      {firstnameError}
                    </p>
                  )}
                </div>

                <div>
                  <label>Last Name</label>

                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastname}
                    onChange={(e) => {
                      setLastname(e.target.value);

                      if (lastnameError) {
                        setLastnameError("");
                      }
                    }}
                  />

                  {lastnameError && (
                    <p className="input-error-message">
                      {lastnameError}
                    </p>
                  )}
                </div>

                <div>
                  <label>Email ID</label>

                  <input
                    type="text"
                    placeholder="Enter your email ID"
                    value={personalEmail}
                    onChange={(e) => {
                      setPersonalEmail(e.target.value);

                      if (personalEmailError) {
                        setPersonalEmailError("");
                      }
                    }}
                  />

                  {personalEmailError && (
                    <p className="input-error-message">
                      {personalEmailError}
                    </p>
                  )}
                </div>
              </div>

              <div className={style.your_donation_container}>
                <p>Your donation</p>

                <div>
                  <p>Your donation</p>
                  <p>{formatCurrency(donationAmount)}</p>
                </div>

                <div>
                  <p>Blimp tip</p>
                  <p>{formatCurrency(tipAmount)}</p>
                </div>

                <div className={style.separator} />

                <div>
                  <p>Total due today</p>
                  <p>{formatCurrency(totalAmount)}</p>
                </div>

                <p>
                  Your total amount will be charged in the fundraiser's
                  currency, US{" "}
                  <strong>
                    ({formatCurrency(totalAmount)})
                  </strong>
                  . International transaction and conversion fees may apply
                  based on your payment method.
                </p>
              </div>

              <button
                className={style.donate_btn}
                onClick={handleDonate}
              >
                Donate
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CheckOutPage;