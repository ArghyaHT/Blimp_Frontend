import React, { useState } from "react";
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

const CheckOutPage = () => {
  const [selectedTab, setSelectedTab] = useState("Give Once");
  const [openCustomTipInput, setOpenCustomTipInput] = useState(false);

  const [donationCheck, setDonationCheck] = useState(false);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");

  const [firstnameError, setFirstnameError] = useState("");
  const [lastnameError, setLastnameError] = useState("");
  const [personalEmailError, setPersonalEmailError] = useState("");

  const [value, setValue] = useState([0, 50]);

  return (
    <main>
      <section className={style.checkoutSectionContainer}>
        <div>
          <div>
            <p>Reduce Homelessness</p>
            <p>Still $8271 to go. Help us amplify</p>
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
                <div>
                  <p>$25</p>
                </div>
                <div>
                  <p>$50</p>
                </div>
                <div>
                  <p>$100</p>
                </div>
                <div>
                  <p>$500</p>
                </div>
                <div>
                  <p>$1000</p>
                </div>
              </div>

              <div>
                <p>$</p>
                <p>1000.00</p>
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
                    left: `calc(${value[1]}% - 1.5rem)`, // 🔥 Position above the second thumb
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
                  defaultValue={[0, 50]}
                  value={value}
                  onInput={setValue}
                  thumbsDisabled={[true, false]}
                  rangeSlideDisabled={true}
                />
              </div>

              <button
                onClick={() => {
                  setOpenCustomTipInput((prev) => !prev);
                }}
              >
                Enter custom tip
              </button>

              {openCustomTipInput && (
                <input
                  placeholder="Enter custom input"
                  className={style.custom_input}
                />
              )}

              <div className={style.tip_container}>
                {value[1] ? (
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
                        <div>
                          <p>1.5%</p>
                        </div>
                        <div>
                          <p>3%</p>
                        </div>
                        <div>
                          <p>5%</p>
                        </div>
                      </div>
                      <p>Your tip: $0</p>
                    </div>
                  </>
                )}
              </div>

              <div className={style.donation_header}>
                <div>
                  <Switch
                    // width={40}
                    // height={20}
                    // handleDiameter={14}
                    offColor="#97A5B4"
                    onColor="#0A84FF"
                    readOnly
                    checked={donationCheck}
                    onChange={() => {
                      setDonationCheck((prev) => !prev);
                    }}
                  />
                  <p>Donate Anonymously</p>
                </div>
                <p>Turn on to keep your identity private on the fundraiser</p>
              </div>

              <div className={style.personal_info_container}>
                <p>Personal Information</p>

                <div>
                  <label>First Name</label>
                  <input
                    type="text"
                    placeholder="Enter your first name"
                    value={firstname}
                    onChange={(e) => setFirstname(e.target.value)}
                  />
                  {firstnameError && (
                    <p className="input-error-message">{firstnameError}</p>
                  )}
                </div>

                <div>
                  <label>Last Name</label>
                  <input
                    type="text"
                    placeholder="Enter your last name"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                  />
                  {lastnameError && (
                    <p className="input-error-message">{lastnameError}</p>
                  )}
                </div>

                <div>
                  <label>Email ID</label>
                  <input
                    type="text"
                    placeholder="Enter your email ID"
                    value={personalEmail}
                    onChange={(e) => setPersonalEmail(e.target.value)}
                  />
                  {personalEmailError && (
                    <p className="input-error-message">{personalEmailError}</p>
                  )}
                </div>
              </div>

              <div className={style.your_donation_container}>
                <p>Your donation</p>
                <div>
                  <p>Your donation</p>
                  <p>$1000.00</p>
                </div>
                <div>
                  <p>Blimp tip</p>
                  <p>$0.00</p>
                </div>
                <div className={style.separator} />
                <div>
                  <p>Total due today</p>
                  <p>$1000</p>
                </div>
                <p>
                  Your total amount will be charged in the fundraiser's
                  currency, US <strong>($9.00)</strong>. International
                  transaction and conversion fees may apply based on your
                  payment method.
                </p>
              </div>

              <button className={style.donate_btn}>Donate</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CheckOutPage;
