import React, { useEffect, useRef, useState } from "react";
import styles from "./Profile.module.css";
import { EditIcon, CameraIcon, ProfileIcon } from "../../../icons";
import { useAuth } from "../../../context/AuthContext";
import { PhoneNumberUtil } from "google-libphonenumber";
import { PhoneInput } from "react-international-phone";
import toast from "react-hot-toast";
import { toastStyle } from "../../../utils/toastStyles";
import api from "../../../api/api";
import { ClipLoader } from "react-spinners";
import { Skeleton } from "@mui/material";
import { useGlobalContext } from "../../../context/GlobalContext";
import { validateImageQualityAndSafety } from "../../../utils/imageValidator";

const Profile = () => {

  const {
    user,
    setUser,
    isAuthenticated,
    userId
  } = useAuth()

  const { mobileWidth } = useGlobalContext();

  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("")

  useEffect(() => {
    if (isAuthenticated && user) {
      setFullname(user?.fullname);
      setEmail(user?.email);
      setPhonenumber(`${user?.country_code}${user?.phone_number}`)
    }
  }, [user, isAuthenticated])

  // error state
  const [fullnameError, setFullnameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [phonenumberError, setPhonenumberError] = useState("")
  const [countryflag, setCountryFlag] = useState("gb");
  const [countryCode, setCountryCode] = useState("");
  const [invalidnumber, setInvalidNumber] = useState(false);

  // console.log("User in profile page:", user);

  const phoneRef = useRef();

  const phoneUtil = PhoneNumberUtil.getInstance();

  const isPhoneValid = (phone) => {
    try {
      return phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
    } catch (error) {
      return false;
    }
  };


  const handlePhoneChange = (phone, meta) => {
    setPhonenumberError("");
    const { country } = meta;

    const isValid = isPhoneValid(phone);

    if (isValid) {
      setPhonenumber(phone);
      setCountryCode(country?.dialCode);
      setCountryFlag(country?.iso2);
      setInvalidNumber(false);
    } else {
      setInvalidNumber(true);
    }
  };

  const [profileLoader, setProfileLoader] = useState(false)

  const handleUpdateProfile = async () => {
    let hasError = false;

    setFullnameError("")
    setEmailError("")
    setPhonenumberError("")

    if (fullname.trim() === "") {
      setFullnameError("Full name is required");
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError("Please enter your email address.")
      hasError = true
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format")
      hasError = true
    };

    if (!phonenumber.trim()) {
      setPhonenumberError("Phone number is required");
      hasError = true;
    } else if (invalidnumber) {
      setPhonenumberError("Invalid phone number");
      hasError = true;
    }

    if (hasError) return

    try {
      const profileData = {
        country_code: countryCode,
        user_id: userId,
        fullname: fullname,
        phone_number: Number(phonenumber.replace("+", "").slice(countryCode.length)),
      };

      setProfileLoader(true);

      const { data } = await api.post("/update-profile", profileData);

      if (data.code === 200) {
        toast.success(data?.message, { duration: 3000, style: toastStyle });

        setFullnameError("")
        setEmailError("")
        setPhonenumberError("")

      } else {
        toast.error("Error while sending", { duration: 3000, style: toastStyle });
      }

    } catch (error) {
      toast.error("Something went wrong. Please try again.", { duration: 3000, style: toastStyle });
    } finally {
      setProfileLoader(false)
    }

  }

  const [profileImage, setProfileImage] = useState(null);
  const [profileImageLoader, setProfileImageLoader] = useState(false);

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {

      const allowedTypes = ["image/jpeg", "image/webp", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload only valid image files (JPEG, WebP, PNG).", { duration: 3000, style: toastStyle });
        return;
      }

      const maxSizeInBytes = 5 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        toast.error("File size must be lower than 5mb", { duration: 3000, style: toastStyle });
        return;
      }

      try {
        await validateImageQualityAndSafety(file, { type: "profile", minWidth: 300, minHeight: 300 });
      } catch (validationErr) {
        toast.error(validationErr.message, { duration: 4000, style: toastStyle });
        e.target.value = "";
        return;
      }

      const formData = new FormData();

      formData.append('user_id', userId);
      formData.append('profile_picture', file);

      try {
        setProfileImageLoader(true)
        const { data } = await api.post('/upload-profile-pic', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (data.code === 200) {
          setProfileImage(URL.createObjectURL(file));
        } else {
          toast.error("Failed to upload image", { duration: 3000, style: toastStyle });
        }

      } catch (error) {
        toast.error("Failed to upload image", { duration: 3000, style: toastStyle });
      } finally {
        setProfileImageLoader(false)
      }

    }
  };

  // console.log(user?.profile_picture)

  return (
    <div className={styles.profileContainer}>
      {/* Profile Picture Section */}
      <div className={styles.avatarWrapper}>
        <div className={styles.avatar}>
          <div
            className={styles.profileImageContainer}
          >
            {profileImageLoader ? (
              <Skeleton
                variant="circular"
                sx={{
                  width: "100%",
                  height: "100%",
                }}
              />
            ) : profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : user?.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className={styles.profileImage}
              />
            ) : (
              <ProfileIcon size={mobileWidth ? "14rem" : "17rem"} />
            )}
          </div>


          {/* Hidden file input */}
          <input
            id="profileUpload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
          />

          {/* Camera icon overlay */}
          <label htmlFor="profileUpload" className={styles.cameraIcon}>
            <CameraIcon size="2rem" />
          </label>
        </div>

      </div>


      {/* Input Fields */}
      <div className={styles.form}>
        {/* Name */}
        <div className={styles.inputGroup}>
          <input type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Enter your full name"
          />
          {fullnameError && (
            <p className="input-error-message">{fullnameError}</p>
          )}
        </div>

        {/* Email */}
        <div className={styles.inputGroup}>
          <input
            type="email"
            value={email}
            readOnly
            placeholder="Enter your email address"
          />

          {emailError && (
            <p className="input-error-message">{emailError}</p>
          )}
        </div>

        {/* Phone */}
        <div className={styles.inputGroup}>

          <div className={styles.phoneContainer}>
            <PhoneInput
              aria-labelledby="mobileLabel"
              forceDialCode={true}
              defaultCountry={countryflag}
              value={phonenumber}
              onChange={(phone, meta) => handlePhoneChange(phone, meta)}
            />
          </div>

          {phonenumberError && (
            <p className="input-error-message">{phonenumberError}</p>
          )}

        </div>

      </div>

      {/* Update Button */}
      <button
        className={styles.updateBtn}
        onClick={handleUpdateProfile}
      >{profileLoader ? <ClipLoader
        size={"3.6rem"}
        aria-label="Loading Spinner"
        data-testid="loader"
        color="#fff"
      /> : "Update"}</button>
    </div>
  );
};

export default Profile;
