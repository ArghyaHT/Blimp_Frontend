import React, { useEffect, useRef, useState } from "react";
import styles from "./StartCampaign.module.css";
import { DownArrow, UpArrow } from "../../icons";
import api from "../../api/api";
import Skeleton from "@mui/material/Skeleton";
import { useAuth } from "../../context/AuthContext";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import { toastStyle } from "../../utils/toastStyles";
import { set, get, del } from "idb-keyval";
import { useNavigate } from "react-router-dom";
import TiptapEditor from "../../components/Tiptap/TiptapEditor";
import { PhoneInput } from "react-international-phone";
import { PhoneNumberUtil } from "google-libphonenumber";
import { validateImageQualityAndSafety } from "../../utils/imageValidator";

const StartCampaign = () => {
  const navigate = useNavigate();
  const { user, setUser, setIsAuthenticated, userId, setUserId } = useAuth();

  const parseSelectedCategory =
    JSON.parse(localStorage.getItem("selectedCategory")) || null;
  const parseSelectedCountry =
    JSON.parse(localStorage.getItem("selectedCountry")) || null;
  const parseTargetedAmount =
    JSON.parse(localStorage.getItem("targetedAmount")) || null;
  const parseCampaignTitle =
    JSON.parse(localStorage.getItem("campaignTitle")) || "";
  const parseCampaignType =
    JSON.parse(localStorage.getItem("campaignType")) || "";
  const parseBeneficiaryDetail =
    JSON.parse(localStorage.getItem("beneficiaryDetail")) || "";
  const parseSelectedCampaingDescription =
    JSON.parse(localStorage.getItem("selectedCampaingDescription")) || "";
  const parseBankName =
    JSON.parse(localStorage.getItem("bankName")) || "";
  const parseBankAddress =
    JSON.parse(localStorage.getItem("bankAddress")) || "";
  const parseAccountHolderName =
    JSON.parse(localStorage.getItem("accountHolderName")) || "";
  const parseAccountNumber =
    JSON.parse(localStorage.getItem("accountNumber")) || "";
  const parseBankIfsc =
    JSON.parse(localStorage.getItem("bankIfsc")) || "";

  useEffect(() => {
    const fetch_banner_image = async () => {
      const idx_banner_image = (await get("bannerImage")) || "";

      setBannerImage(idx_banner_image);
    };

    const fetch_campaign_images = async () => {
      const idx_campaign_images = (await get("campaignImages")) || [];

      if (idx_campaign_images.length > 0) {
        setSelectedCampaignImages(idx_campaign_images);
      }
    };

    fetch_banner_image();
    fetch_campaign_images();
  }, []);

  const [stepper, setStepper] = useState([
    {
      id: 1,
      name: "Category",
    },
    {
      id: 2,
      name: "Country",
    },
    {
      id: 3,
      name: "Goal",
    },
    {
      id: 4,
      name: "Title",
    },
    {
      id: 5,
      name: "Image",
    },
    {
      id: 6,
      name: "You",
    },
    {
      id: 7,
      name: "Story",
    },
    {
      id: 8,
      name: "Payment",
    },
  ]);
  const [selectedStep, setSelectedStep] = useState(1);

  const [categories, setCategories] = useState({
    loading: false,
    error: null,
    data: {},
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setCategories((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.post("/get-category");
        if (data.code === 200) {
          setCategories({ loading: false, error: null, data });
        } else if (data.code === 400) {
          setCategories({
            loading: false,
            error: data.message,
            data: {},
          });
        }
      } catch (error) {
        setCategories({ loading: false, error: error.message, data: {} });
      }
    };

    fetchCategories();
  }, []);

  const [countries, setCountries] = useState({
    loading: false,
    error: null,
    data: {},
  });

  useEffect(() => {
    const fetchCountries = async () => {
      setCountries((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await api.post("/get-countries");
        if (data.code === 200) {
          setCountries({ loading: false, error: null, data });
        } else if (data.code === 400) {
          setCountries({
            loading: false,
            error: data.message,
            data: {},
          });
        }
      } catch (error) {
        setCountries({ loading: false, error: error.message, data: {} });
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (user?.fullname || user?.email) {
      setSelectedName(user?.fullname);
      setSelectedEmail(user?.email);
    }
  }, [user?.fullname, user?.email]);

  const [selectedCategoryOpen, setSelectedCategoryOpen] = useState(false);
  const [selectedCountryOpen, setSelectedCountryOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(
    parseSelectedCategory
  );
  const [selectedCountry, setSelectedCountry] = useState(parseSelectedCountry);
  const [targetedAmount, setTargetedAmount] = useState(parseTargetedAmount);
  const [campaignTitle, setCampaignTitle] = useState(parseCampaignTitle);
  const [selectedName, setSelectedName] = useState("");
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedCampaignType, setSelectedCampaignType] =
    useState(parseCampaignType);
  const [selectedCampaingDescription, setSelectedCampaignDescription] =
    useState(
      parseSelectedCampaingDescription ||
        `
      <h2 style="text-align:center;">Welcome to the blimp editor 👋</h2>

      <p>
        Type anything you want and style it however you like ✨.
        You can format your text using the toolbar above.
      </p>

      <p>
        Try using <strong>Bold</strong>, <em>Italic</em>, <u>Underline</u>, or
        <s>Strikethrough</s>.
        You can also change <span style="text-align:center; display:block;"><strong>alignment</strong></span>.
      </p>

      <h3>Features you can use:</h3>
      <ul>
        <li>Bold, Italic, Underline, Strike</li>
        <li>Left / Center / Right / Justify alignment</li>
        <li>Bullet and Numbered Lists</li>
        <li>Quotes</li>
      </ul>

      <p>Here's a quick example list:</p>
      <ul>
        <li>First bullet item</li>
        <li>Second bullet item</li>
      </ul>

      <blockquote>
        “Writing is the painting of the voice.” — Voltaire
      </blockquote>

      <p>
        Start editing this text to begin!
      </p>
    `
    );
  const [beneficiaryDetail, setBeneficiaryDetail] = useState(
    parseBeneficiaryDetail
  );
  const [bankName, setBankName] = useState(parseBankName);
  const [bankAddress, setBankAddress] = useState(parseBankAddress);
  const [accountHolderName, setAccountHolderName] = useState(
    parseAccountHolderName || user?.fullname || ""
  );
  const [accountNumber, setAccountNumber] = useState(parseAccountNumber);
  const [bankIfsc, setBankIfsc] = useState(parseBankIfsc);
  const [selectedCampaignImages, setSelectedCampaignImages] = useState([]);
  const [bannerImage, setBannerImage] = useState("");

  const handle_file_select = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const maxImages = 5;
    const maxFileSize = 25 * 1024 * 1024; // 25MB

    if (files.length > maxImages) {
      toast.error(`You can upload a maximum of ${maxImages} images at once.`, { style: toastStyle });
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not a valid image file.`, { style: toastStyle });
        continue;
      }

      if (file.size > maxFileSize) {
        toast.error(`"${file.name}" exceeds 25MB limit. Please select a smaller file.`, { style: toastStyle });
        continue;
      }

      try {
        await validateImageQualityAndSafety(file, { type: "gallery" });
        validFiles.push(file);
      } catch (validationErr) {
        toast.error(validationErr.message, { style: toastStyle, duration: 4000 });
      }
    }

    // If no valid files, stop
    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // Convert files to Base64
    const fileReaders = validFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            id: Date.now() + Math.random(),
            file,
            preview: reader.result,
          }); // Base64
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then((filePreviews) => {
      setSelectedCampaignImages((prev) => {
        const merged = [...prev, ...filePreviews].slice(0, maxImages);

        set("campaignImages", merged);

        return merged;
      });
    });

    // Reset input value so same file can be reselected
    e.target.value = "";
  };

  const handle_drop_click = () => {
    document.getElementById("campaign-file-input").click();
  };

  const handle_remove_image = async (image_id) => {
    const campaign_images = (await get("campaignImages")) || [];
    const updated_campaign_images = campaign_images.filter(
      (item) => item.id !== image_id
    );

    await set("campaignImages", updated_campaign_images);
    setSelectedCampaignImages(updated_campaign_images);
  };

  // console.log("Idx file", bannerImage.file);

  const handle_banner_file_select = async (e) => {
    const file = e.target.files[0];
    const maxFileSize = 25 * 1024 * 1024; // 25MB

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(`"${file.name}" is not a valid image file.`, { style: toastStyle });
      e.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      toast.error(`"${file.name}" exceeds file size limit. Please select a smaller image.`, { style: toastStyle });
      e.target.value = "";
      return;
    }

    try {
      await validateImageQualityAndSafety(file, { type: "banner" });

      const reader = new FileReader();
      const filePreview = await new Promise((resolve, reject) => {
        reader.onload = () => resolve({ file, preview: reader.result }); // Base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setBannerImage(filePreview);
      await set("bannerImage", filePreview);
    } catch (error) {
      console.error("Image validation or reading error:", error);
      toast.error(error.message || "Failed to validate selected image.", { style: toastStyle, duration: 4000 });
    }

    e.target.value = "";
  };

  const handle_banner_image_drop_click = () => {
    document.getElementById("campaign-banner-file-input").click();
  };

  const handle_remove_banner_image = async () => {
    setBannerImage("");
    await del("bannerImage");
  };

  const [startCampaign, setStartCampaign] = useState({
    loading: false,
    error: null,
    data: {},
  });

  const start_campaign_handler = async (isDraft = false) => {
    if (!selectedCategory) {
      return toast.error("Category is not selected", {
        duration: 3000,
        style: toastStyle,
      });
    }

    if (!selectedCountry) {
      return toast.error("Country is not selected", {
        duration: 3000,
        style: toastStyle,
      });
    }

    if (!targetedAmount) {
      return toast.error("Targeted amount is required", {
        duration: 3000,
        style: toastStyle,
      });
    }

    if (!campaignTitle) {
      return toast.error("Campaign title is required", {
        duration: 3000,
        style: toastStyle,
      });
    }

    if (!isDraft) {
      if (!bannerImage) {
        return toast.error("Banner image is required", {
          duration: 3000,
          style: toastStyle,
        });
      }

      if (selectedCampaingDescription === "<p></p>") {
        return toast.error("Campaign description is required", {
          duration: 3000,
          style: toastStyle,
        });
      }

      if (selectedCampaignImages.length === 0) {
        return toast.error("Atleast one campaign image is required", {
          duration: 3000,
          style: toastStyle,
        });
      }

      if (!bankName.trim()) {
        return toast.error("Bank name is required", {
          duration: 3000,
          style: toastStyle,
        });
      }

      if (!accountHolderName.trim()) {
        return toast.error("Account holder name is required", {
          duration: 3000,
          style: toastStyle,
        });
      }

      if (!accountNumber.toString().trim()) {
        return toast.error("Account number is required", {
          duration: 3000,
          style: toastStyle,
        });
      }

      if (!bankIfsc.trim()) {
        return toast.error("Bank IFSC / SWIFT code is required", {
          duration: 3000,
          style: toastStyle,
        });
      }
    }

    try {
      const formData = new FormData();

      formData.append("user_id", user.id);
      formData.append("category", selectedCategory.id);
      formData.append("country", selectedCountry.id);
      formData.append("target_amount", targetedAmount);
      formData.append("purpose", 1);
      formData.append("campaign_name", campaignTitle);
      formData.append(
        "description",
        JSON.stringify(selectedCampaingDescription)
      );
      formData.append("campagin_date", new Date().toISOString().split("T")[0]);
      formData.append("hear_about_blimp", "Online");
      formData.append("name", user.fullname);
      formData.append("email", user.email);
      formData.append("request_for_donor", 1);
      formData.append("team_memeber_name", beneficiaryDetail || "");
      formData.append("is_draft", isDraft ? 1 : 0);
      formData.append("bank_name", bankName || "");
      formData.append("bank_address", bankAddress || "");
      formData.append("account_holder_name", accountHolderName || "");
      formData.append("account_number", accountNumber || "");
      formData.append("bank_ifsc", bankIfsc || "");
      formData.append("bank_account_name", accountHolderName || "");
      formData.append("bank_account_number", accountNumber || "");
      formData.append("ifsc_code", bankIfsc || "");

      // ✅ Append single file
      if (bannerImage?.file) {
        formData.append("banner_image", bannerImage.file);
      }

      // ✅ Append multiple files
      if (selectedCampaignImages?.length > 0) {
        selectedCampaignImages.forEach((item, index) => {
          if (item.file) {
            formData.append("images", item.file); // backend must accept array files
          }
        });
      }

      setStartCampaign((prev) => ({ ...prev, loading: true, error: null }));

      const { data } = await api.post("/campaigns", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.code === 200) {
        setStartCampaign({ loading: false, error: null, data });
        const keysToRemove = [
          "beneficiaryDetail",
          "campaignTitle",
          "selectedCampaingDescription",
          "selectedCategory",
          "selectedCountry",
          "targetedAmount",
          "userEmail",
          "userFullname",
          "bankName",
          "bankAddress",
          "accountHolderName",
          "accountNumber",
          "bankIfsc",
        ];

        keysToRemove.forEach((key) => localStorage.removeItem(key));
        await del("bannerImage");
        await del("campaignImages");
        toast.success(isDraft ? "Campaign saved as draft!" : data.message, { duration: 3000, style: toastStyle });
        navigate(isDraft ? "/account/draft-campaigns" : "/account/active-campaigns");
      } else if (data.code === 400) {
        toast.error(data.message, { duration: 3000, style: toastStyle });
        setStartCampaign({ loading: false, error: data.message, data: {} });
      }
    } catch (error) {
      setStartCampaign((prev) => ({ ...prev, error: error.message }));
    } finally {
      setStartCampaign((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleSaveDraft = () => {
    if (!selectedCategory) {
      toast.error("Please select a Cause Category (Step 1) before saving draft", {
        duration: 3000,
        style: toastStyle,
      });
      setSelectedStep(1);
      return;
    }
    if (!selectedCountry) {
      toast.error("Please select a Country (Step 2) before saving draft", {
        duration: 3000,
        style: toastStyle,
      });
      setSelectedStep(2);
      return;
    }
    if (!targetedAmount || Number(targetedAmount) <= 0) {
      toast.error("Please enter a Target Goal Amount (Step 3) before saving draft", {
        duration: 3000,
        style: toastStyle,
      });
      setSelectedStep(3);
      return;
    }
    start_campaign_handler(true);
  };

  // signin error states

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupPhoneNumber, setSignupPhoneNumber] = useState("");
  const [accountType, setAccountType] = useState("individual");

  // signup error states
  const [firstnameError, setFirstnameError] = useState("");
  const [lastnameError, setLastnameError] = useState("");
  const [signupEmailError, setSignupEmailError] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState("");
  const [signupConfirmPasswordError, setSignupConfirmPasswordError] =
    useState("");
  const [signupPhoneNumberError, setSignupPhoneNumberError] = useState("");
  const [invalidnumber, setInvalidNumber] = useState(false);

  const [signupLoader, setSignupLoader] = useState(false);
  const [countryflag, setCountryFlag] = useState("gb");
  const [countryCode, setCountryCode] = useState("");

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
    setSignupPhoneNumberError("");
    const { country } = meta;

    const isValid = isPhoneValid(phone);

    if (isValid) {
      setSignupPhoneNumber(phone);
      setCountryCode(country?.dialCode);
      setCountryFlag(country?.iso2);
      setInvalidNumber(false);
    } else {
      setInvalidNumber(true);
    }
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const signupHandler = async () => {
    let hasError = false;

    // Reset errors before checking
    setFirstnameError("");
    setLastnameError("");
    setSignupEmailError("");
    setSignupPasswordError("");
    setSignupConfirmPasswordError("");
    setSignupPhoneNumberError("");
    setAccountType("individual");

    if (!firstname.trim()) {
      setFirstnameError("First name is required");
      hasError = true;
    }

    if (!lastname.trim()) {
      setLastnameError("Last name is required");
      hasError = true;
    }

    if (!signupEmail.trim()) {
      setSignupEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(signupEmail)) {
      setSignupEmailError("Invalid email format");
      hasError = true;
    }

    if (!signupPhoneNumber.trim()) {
      setSignupPhoneNumberError("Phone number is required");
      hasError = true;
    } else if (invalidnumber) {
      setSignupPhoneNumberError("Invalid phone number");
      hasError = true;
    }

    if (!signupPassword.trim()) {
      setSignupPasswordError("Password is required");
      hasError = true;
    } else if (!validatePassword(signupPassword)) {
      setSignupPasswordError(
        "Password must be at least 8 characters long and contain uppercase, lowercase, and a number"
      );
      hasError = true;
    }

    if (!signupConfirmPassword.trim()) {
      setSignupConfirmPasswordError("Confirm your password");
      hasError = true;
    } else if (signupPassword !== signupConfirmPassword) {
      setSignupConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    // If all validations pass
    const signupData = {
      fullname: `${firstname} ${lastname}`,
      email: signupEmail,
      password: signupPassword,
      account_type: accountType === "individual" ? 1 : 2,
      phone_number: Number(
        signupPhoneNumber.replace("+", "").slice(countryCode.length)
      ),
      country_code: Number(countryCode),
    };

    // try {
    //   setSignupLoader(true);
    //   const { data } = await api.post("/signup", signupData);

    //   if (data.code === 200) {
    //     toast.success("Your account has been created successfully!", {
    //       duration: 3000,
    //       style: toastStyle,
    //     });

    //     const signindata = {
    //       emailOrPhoneNumber: signupData.email,
    //       password: signupData.password,
    //     };

    //     const { data } = await api.post("/login", signindata);

    //     if (data.code === 200) {
    //       localStorage.setItem("usersignin", "true");
    //       localStorage.setItem("userId", data?.data?.userData?.id);
    //       setIsAuthenticated(true);
    //       setUserId(data?.data?.userData?.id);

    //       localStorage.setItem(
    //         "userFullname",
    //         JSON.stringify(signupData?.fullname)
    //       );
    //       localStorage.setItem("userEmail", JSON.stringify(signupData?.email));
    //       setSelectedStep(7);
    //     }
    //   } else {
    //     toast.error(data.message, { duration: 3000, style: toastStyle });
    //   }
    // } catch (error) {
    //   toast.error("Signup failed", { duration: 3000, style: toastStyle });
    // } finally {
    //   setSignupLoader(false);
    // }

    try {
      setSignupLoader(true);

      // --- SIGNUP ---
      const signupResponse = await api.post("/signup", signupData);
      const signupResult = signupResponse.data;

      if (signupResult.code !== 200) {
        toast.error(signupResult.message, {
          duration: 3000,
          style: toastStyle,
        });
        return;
      }

      toast.success("Your account has been created successfully!", {
        duration: 3000,
        style: toastStyle,
      });

      // --- AUTO LOGIN AFTER SIGNUP ---
      const loginPayload = {
        emailOrPhoneNumber: signupData.email,
        password: signupData.password,
      };

      const loginResponse = await api.post("/login", loginPayload);
      const loginResult = loginResponse.data;

      if (loginResult.code !== 200) {
        toast.error("Login failed after signup", {
          duration: 3000,
          style: toastStyle,
        });
        return;
      }

      // --- SAVE USER DATA ---
      const userId = loginResult?.data?.userData?.id;

      localStorage.setItem("usersignin", "true");
      localStorage.setItem("userId", userId);
      localStorage.setItem(
        "userFullname",
        JSON.stringify(signupData?.fullname)
      );
      localStorage.setItem("userEmail", JSON.stringify(signupData?.email));

      setIsAuthenticated(true);
      setUserId(userId);

      // Go to next step
      setSelectedStep(7);
    } catch (error) {
      toast.error("Signup failed", { duration: 3000, style: toastStyle });
    } finally {
      setSignupLoader(false);
    }
  };

  const logout_handler = async () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("usersignin");
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);

    const keysToRemove = [
      "beneficiaryDetail",
      "campaignTitle",
      "selectedCampaingDescription",
      "selectedCategory",
      "selectedCountry",
      "targetedAmount",
      "userEmail",
      "userFullname",
    ];

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    await del("bannerImage");
    await del("campaignImages");

    navigate("/login-signup");
  };

  return (
    <section className={styles.startCampaignContainer}>
      <div>
        <div className={styles.mobileStepperCircle}>
          <div>
            <p>{selectedStep}</p>
          </div>
        </div>

        <div>
          <h2>
            {selectedStep === 1 && "What Cause area are you raising funds for?"}

            {selectedStep === 2 && "What country are you based in?"}

            {selectedStep === 3 && "How much are you aiming to raise?"}

            {selectedStep === 4 && "What would you like to name your campaign?"}

            {selectedStep === 5 &&
              "Select banner images to represent your campaign"}

            {selectedStep === 6 && "Tell us about yourself"}

            {selectedStep === 7 && "What's the purpose of your fundraiser?"}

            {selectedStep === 8 &&
              "Congratulations! Your campaign has been successfully created."}
          </h2>
          <p>
            {selectedStep === 1 &&
              "Libero dictum ut purus ut vel sit egestas. Ut ac mattis senectus ac suspendisse vitae vel nulla eleifend. Est eros facilisi aenean nisl a. Vitae et fusce purus consectetur."}

            {selectedStep === 2 &&
              "Donations can be received globally, but to accept them, you'll need a bank account and valid ID from one of the eligible countries."}

            {selectedStep === 3 &&
              "Your campaign goal will be set in the local currency of the country you select. You can update your target at any time."}

            {selectedStep === 4 &&
              "No worries—you can always change this later."}

            {selectedStep === 5 &&
              "No worries—you'll be able to upload more images and videos later. Just ensure your image is a .jpg or .png file and smaller than 5MB."}

            {selectedStep === 6 &&
              "Libero dictum ut purus ut vel sit egestas. Ut ac mattis senectus ac suspendisse vitae vel nulla eleifend. Est eros facilisi aenean nisl a. Vitae et fusce purus consectetur."}

            {selectedStep === 7 &&
              "Share the story behind your campaign. Include details like the background of the issue, who you are, what you're working on, and why it matters to you. Let donors know how the funds will be used.Aim for about 500 words (roughly 2,500 characters) for the most effective description. And don't worry—you can update it anytime."}

            {selectedStep === 8 &&
              "No worries if it's not perfect yet—you can keep editing it before you launch."}
          </p>
        </div>

        <div className={styles.largeStepperCircle}>
          {stepper.map((item, index) => {
            return (
              <div
                key={item.id}
                className={styles.stepperItem}
                style={{
                  width: stepper.length - 1 === index ? "6rem" : "14%",
                }}
              >
                <div>
                  {" "}
                  <div className={styles.circleWrapper}>
                    <button
                      onClick={() => {
                        if (!user?.email && (item.id === 7 || item.id === 8)) {
                          return toast.error(
                            "User not found. Plz create an account",
                            { duration: 3000, style: toastStyle }
                          );
                        }
                        setSelectedStep(item.id);
                      }}
                      className={styles.circle}
                      style={{
                        backgroundColor:
                          selectedStep === item.id
                            ? "var(--btn-hover-color)"
                            : "var(--btn-base-color)",
                      }}
                    >
                      <p>{item.id}</p>
                    </button>
                    <p className={styles.label}>{item.name}</p>
                  </div>
                  <div className={styles.line} />
                </div>
              </div>
            );
          })}
        </div>

        {selectedStep === 1 && (
          <div className={styles.stepperCategoryContainer}>
            <div>
              <div onClick={() => setSelectedCategoryOpen((prev) => !prev)}>
                <input
                  type="text"
                  placeholder="Select Category"
                  value={selectedCategory?.name ?? ""}
                  readOnly
                />
                <div>{selectedCategoryOpen ? <UpArrow /> : <DownArrow />}</div>
              </div>

              <button
                onClick={() => {
                  if (!selectedCategory) {
                    return toast.error("Category not selected", {
                      duration: 3000,
                      style: toastStyle,
                    });
                  }

                  localStorage.setItem(
                    "selectedCategory",
                    JSON.stringify(selectedCategory)
                  );
                  setSelectedStep(2);
                }}
              >
                Save and Continue
              </button>

              {selectedCategoryOpen &&
                (categories.loading ? (
                  <div className={styles.drop_down_container_loading}>
                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />

                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />

                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />

                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />
                  </div>
                ) : categories.data?.data?.length > 0 ? (
                  <div className={styles.drop_down_container}>
                    {categories.data?.data?.map((item) => {
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedCategory(item);
                            setSelectedCategoryOpen(false);
                          }}
                        >
                          <p>{item.name}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.drop_down_container_error}>
                    <p>No categories present</p>
                  </div>
                ))}
            </div>

            <div>
              <div>
                <img
                  src="https://www.aljazeera.com/wp-content/uploads/2024/08/AFP__20240823__36EM9XC__v1__HighRes__BangladeshWeatherFlood-1724392248.jpg"
                  alt=""
                />
              </div>
              <div>
                <img
                  src="https://www.aljazeera.com/wp-content/uploads/2024/08/AFP__20240823__36EM9XC__v1__HighRes__BangladeshWeatherFlood-1724392248.jpg"
                  alt=""
                />
              </div>
              <div>
                <img
                  src="https://www.aljazeera.com/wp-content/uploads/2024/08/AFP__20240823__36EM9XC__v1__HighRes__BangladeshWeatherFlood-1724392248.jpg"
                  alt=""
                />
              </div>
              <div>
                <img
                  src="https://www.aljazeera.com/wp-content/uploads/2024/08/AFP__20240823__36EM9XC__v1__HighRes__BangladeshWeatherFlood-1724392248.jpg"
                  alt=""
                />
              </div>
            </div>
          </div>
        )}

        {selectedStep === 2 && (
          <div className={styles.stepperCountryContainer}>
            <div>
              <div onClick={() => setSelectedCountryOpen((prev) => !prev)}>
                <input
                  type="text"
                  placeholder="Select Country"
                  value={`${selectedCountry?.name ?? ""}`.trim()}
                  readOnly
                />

                <div>{selectedCategoryOpen ? <UpArrow /> : <DownArrow />}</div>
              </div>

              <button
                onClick={() => {
                  if (!selectedCountry) {
                    return toast.error("Country not selected", {
                      duration: 3000,
                      style: toastStyle,
                    });
                  }

                  localStorage.setItem(
                    "selectedCountry",
                    JSON.stringify(selectedCountry)
                  );
                  setSelectedStep(3);
                }}
              >
                Save and Continue
              </button>

              {selectedCountryOpen &&
                (countries.loading ? (
                  <div className={styles.drop_down_container_loading}>
                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />

                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />

                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />

                    <Skeleton
                      variant="rectangular"
                      height={"4rem"}
                      animation="wave"
                    />
                  </div>
                ) : countries.data?.data?.length > 0 ? (
                  <div className={styles.drop_down_container}>
                    {countries.data?.data?.map((item) => {
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedCountry(item);
                            setSelectedCountryOpen(false);
                          }}
                        >
                          <p>{item.name}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.drop_down_container_error}>
                    <p>No country present</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {selectedStep === 3 && (
          <div className={styles.stepperGoalContainer}>
            <div>
              <div>
                <input
                  type="text"
                  placeholder="Your goal"
                  value={targetedAmount}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9.]/g, "");
                    setTargetedAmount(numericValue);
                  }}
                />
              </div>

              <button
                onClick={() => {
                  if (!targetedAmount) {
                    return toast.error("Targeted amount is required", {
                      duration: 3000,
                      style: toastStyle,
                    });
                  }

                  localStorage.setItem(
                    "targetedAmount",
                    JSON.stringify(targetedAmount)
                  );
                  setSelectedStep(4);
                }}
              >
                Save and Continue
              </button>
            </div>
          </div>
        )}

        {selectedStep === 4 && (
          <div className={styles.stepperTitleContainer}>
            <div>
              <div>
                <input
                  type="text"
                  placeholder="Name your campaign"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                />
              </div>

              <div className={styles.stepActionButtons}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={startCampaign.loading}
                  className={styles.saveDraftBtn}
                >
                  {startCampaign.loading ? (
                    <ClipLoader size={"2rem"} color="#333" />
                  ) : (
                    "Save as Draft"
                  )}
                </button>

                <button
                  className={styles.saveContinueBtn}
                  onClick={() => {
                    if (!campaignTitle) {
                      return toast.error("Campaign title is required", {
                        duration: 3000,
                        style: toastStyle,
                      });
                    }

                    localStorage.setItem(
                      "campaignTitle",
                      JSON.stringify(campaignTitle)
                    );
                    setSelectedStep(5);
                  }}
                >
                  Save and Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedStep === 5 && (
          <div className={styles.stepperImageContainer}>
            <div className={styles.upload_banner_section}>
              <p className={styles.upload_banner_title}>Upload Banner Image</p>

              <div className={styles.upload_banner_box}>
                {bannerImage ? (
                  <div className={styles.preview_item}>
                    <img
                      src={bannerImage.preview}
                      alt={`preview-${bannerImage.file?.name || "banner"}`}
                      className={styles.preview_image}
                    />
                    <button
                      className={styles.remove_btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handle_remove_banner_image(); // if you have a remove function
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    className={styles.upload_banner_dropzone}
                    onClick={() => handle_banner_image_drop_click()}
                  >
                    <p>📁 Click to select banner image</p>
                  </div>
                )}

                <p className={styles.upload_note}>
                  ** Choose a single banner image (recommended{" "}
                  <strong>1200px * 560px</strong>, max size <strong>5MB</strong>
                  ).
                </p>

                <input
                  id="campaign-banner-file-input"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handle_banner_file_select}
                />
              </div>
            </div>
            <div className={styles.stepActionButtons}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={startCampaign.loading}
                className={styles.saveDraftBtn}
              >
                {startCampaign.loading ? (
                  <ClipLoader size={"2rem"} color="#333" />
                ) : (
                  "Save as Draft"
                )}
              </button>

              <button
                className={styles.saveContinueBtn}
                onClick={async () => {
                  if (!bannerImage) {
                    return toast.error("Banner image is required", {
                      duration: 3000,
                      style: toastStyle,
                    });
                  }
                  setSelectedStep(6);
                }}
              >
                Save and Continue
              </button>
            </div>
          </div>
        )}

        {selectedStep === 6 && (
          <div className={styles.stepperYouContainer}>
            {selectedName && selectedEmail ? (
              <div className={styles.stepperYouFilledUserContainer}>
                <button onClick={logout_handler}>Not You ? Logout</button>
                <div>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={selectedName}
                    // onChange={(e) => setSelectedName(e.target.value)}
                    readOnly
                  />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Your email"
                    value={selectedEmail}
                    // onChange={(e) => setSelectedEmail(e.target.value)}
                    readOnly
                  />
                </div>

                {/* <div>
                <div>
                  <input
                    name="accountType"
                    type="radio"
                    value="individual"
                    checked={selectedCampaignType === "individual"}
                    onChange={(e) => setSelectedCampaignType(e.target.value)}
                  />
                  <p>Individual</p>
                </div>

                <div>
                  <input
                    name="accountType"
                    type="radio"
                    value="organization"
                    checked={selectedCampaignType === "organization"}
                    onChange={(e) => setSelectedCampaignType(e.target.value)}
                  />
                  <p>Organization</p>
                </div>

                <div>
                  <button>Upload File</button>
                  <p>**Passport / National ID (for individuals)</p>
                  <p>**NGO/ONG Registration Certificate (for organizations)</p>
                </div>
              </div> */}

                <div className={styles.stepActionButtons}>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={startCampaign.loading}
                    className={styles.saveDraftBtn}
                  >
                    {startCampaign.loading ? (
                      <ClipLoader size={"2rem"} color="#333" />
                    ) : (
                      "Save as Draft"
                    )}
                  </button>

                  <button
                    className={styles.saveContinueBtn}
                    onClick={() => {
                      if (!selectedName || !selectedEmail) {
                        return;
                      }

                      localStorage.setItem(
                        "userFullname",
                        JSON.stringify(selectedName)
                      );
                      localStorage.setItem(
                        "userEmail",
                        JSON.stringify(selectedEmail)
                      );
                      setSelectedStep(7);
                    }}
                  >
                    Save and Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.stepperYouUnFilledUserContainer}>
                <h2>Create an account to proceed</h2>

                <div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                    />
                    {firstnameError && (
                      <p className={styles.input_error_message}>
                        {firstnameError}
                      </p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                    />
                    {lastnameError && (
                      <p className={styles.input_error_message}>
                        {lastnameError}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Enter your email ID"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                  {signupEmailError && (
                    <p className={styles.input_error_message}>
                      {signupEmailError}
                    </p>
                  )}
                </div>

                <div className={styles.phoneContainer}>
                  <PhoneInput
                    aria-labelledby="mobileLabel"
                    forceDialCode={true}
                    defaultCountry={countryflag}
                    value={signupPhoneNumber}
                    ref={phoneRef}
                    onChange={(phone, meta) => handlePhoneChange(phone, meta)}
                  />
                  {signupPhoneNumberError && (
                    <p className={styles.input_error_message}>
                      {signupPhoneNumberError}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  {signupPasswordError && (
                    <p className={styles.input_error_message}>
                      {signupPasswordError}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  />
                  {signupConfirmPasswordError && (
                    <p className={styles.input_error_message}>
                      {signupConfirmPasswordError}
                    </p>
                  )}
                </div>

                <div className={styles.account_type}>
                  <div>
                    <input
                      name="accountType"
                      type="radio"
                      value="individual"
                      checked={accountType === "individual"}
                      onChange={(e) => setAccountType(e.target.value)}
                    />
                    <p>Individual</p>
                  </div>

                  <div>
                    <input
                      name="accountType"
                      type="radio"
                      value="organization"
                      checked={accountType === "organization"}
                      onChange={(e) => setAccountType(e.target.value)}
                    />
                    <p>Organization</p>
                  </div>
                </div>

                <button onClick={signupHandler} disabled={signupLoader}>
                  {signupLoader ? (
                    <ClipLoader
                      color="#fff"
                      size={"3rem"}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  ) : (
                    "Create My Account"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {selectedStep === 7 && (
          <div className={styles.stepperStoryContainer}>
            {/* <div>
              <input
                type="text"
                placeholder="Name of the concerned person"
                value={beneficiaryDetail}
                onChange={(e) => setBeneficiaryDetail(e.target.value)}
              />
            </div> */}

            <div>
              <TiptapEditor
                selectedCampaingDescription={selectedCampaingDescription}
                setSelectedCampaignDescription={setSelectedCampaignDescription}
              />
            </div>

            {/* <div>
              <textarea
                name="campaign_description"
                id="campaign_description"
                placeholder="Enter your campaign description"
                value={selectedCampaingDescription}
                onChange={(e) => setSelectedCampaignDescription(e.target.value)}
              />
            </div> */}

            {/* <div>
              <div>
                <div>
                  <p>Heading</p>
                </div>
                <div>
                  <div>
                    <p>B</p>
                  </div>
                  <div>
                    <p>/</p>
                  </div>
                  <div>
                    <p>U</p>
                  </div>
                </div>
              </div>
              <div>
                <textarea
                  name="campaign_description"
                  id="campaign_description"
                  value={selectedCampaingDescription}
                  onChange={(e) =>
                    setSelectedCampaignDescription(e.target.value)
                  }
                />
              </div>
            </div> */}

            {/* <div>
              <p>Upload Campaign Images</p>

              <div>
                <div>
                  <p>Drag or click to select file</p>
                </div>
                <button>Upload Document</button>
              </div>

              <p>
                ** Choose up to 5 Image (512px X 512px is perfect, max image
                size 1MB, max total size 5MB).
              </p>
            </div> */}

            <div className={styles.upload_section}>
              <p className={styles.upload_title}>Upload Campaign Images</p>

              <div className={styles.upload_box}>
                <div
                  className={styles.upload_dropzone}
                  onClick={handle_drop_click}
                >
                  {selectedCampaignImages.length === 0 ? (
                    <p>📁 Click to select files</p>
                  ) : (
                    <div className={styles.preview_grid}>
                      {selectedCampaignImages.map((img, index) => (
                        <div key={index} className={styles.preview_item}>
                          <img
                            src={img.preview}
                            alt={`preview-${index}`}
                            className={styles.preview_image}
                          />
                          <button
                            className={styles.remove_btn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handle_remove_image(img.id);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  id="campaign-file-input"
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handle_file_select}
                />

                {/* <button className={styles.upload_btn}>Upload</button> */}
              </div>

              <p className={styles.upload_note}>
                ** You can upload up to <strong>5 images</strong> (512x512px
                recommended, max <strong>1MB each</strong>, total{" "}
                <strong>5MB</strong>).
              </p>
            </div>

            <div className={styles.stepActionButtons}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={startCampaign.loading}
                className={styles.saveDraftBtn}
              >
                {startCampaign.loading ? (
                  <ClipLoader size={"2rem"} color="#333" />
                ) : (
                  "Save as Draft"
                )}
              </button>

              <button
                className={styles.saveContinueBtn}
                onClick={() => {
                  if (selectedCampaingDescription === "<p></p>") {
                    return toast.error("Campaign description is required", {
                      duration: 3000,
                      style: toastStyle,
                    });
                  }

                  if (selectedCampaignImages.length === 0) {
                    return toast.error("Atleast one campaign image is required", {
                      duration: 3000,
                      style: toastStyle,
                    });
                  }

                  localStorage.setItem(
                    "selectedCampaingDescription",
                    JSON.stringify(selectedCampaingDescription)
                  );
                  localStorage.setItem(
                    "beneficiaryDetail",
                    JSON.stringify(beneficiaryDetail)
                  );
                  setSelectedStep(8);
                }}
              >
                Save and Continue
              </button>
            </div>
          </div>
        )}

        {selectedStep === 8 && (
          
          <div className={styles.stepperPaymentContainer}>
            <div className={styles.paymentFormGroup}>
              <div>
                <label>Bank Name *</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Bank, Chase, Barclays"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    localStorage.setItem("bankName", JSON.stringify(e.target.value));
                  }}
                />
              </div>

              <div>
                <label>Bank Branch / Address</label>
                <input
                  type="text"
                  placeholder="e.g. Downtown Branch, New York"
                  value={bankAddress}
                  onChange={(e) => {
                    setBankAddress(e.target.value);
                    localStorage.setItem("bankAddress", JSON.stringify(e.target.value));
                  }}
                />
              </div>

              <div>
                <label>Account Holder Name *</label>
                <input
                  type="text"
                  placeholder="Full name as on bank account"
                  value={accountHolderName}
                  onChange={(e) => {
                    setAccountHolderName(e.target.value);
                    localStorage.setItem("accountHolderName", JSON.stringify(e.target.value));
                  }}
                />
              </div>

              <div>
                <label>Account Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={accountNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setAccountNumber(val);
                    localStorage.setItem("accountNumber", JSON.stringify(val));
                  }}
                />
              </div>

              <div>
                <label>Bank IFSC / SWIFT Code *</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC0001234 / CHASUS33"
                  value={bankIfsc}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase();
                    setBankIfsc(val);
                    localStorage.setItem("bankIfsc", JSON.stringify(val));
                  }}
                />
              </div>
            </div>

            <div className={styles.stepActionButtons}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={startCampaign.loading}
                className={styles.saveDraftBtn}
              >
                {startCampaign.loading ? (
                  <ClipLoader size={"2rem"} color="#333" />
                ) : (
                  "Save as Draft"
                )}
              </button>

              <button
                onClick={() => start_campaign_handler(false)}
                disabled={startCampaign.loading}
                className={styles.submitPaymentBtn}
              >
                {startCampaign.loading ? (
                  <ClipLoader
                    size={"3rem"}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    color="#fff"
                  />
                ) : (
                  "Save Payment & Launch Campaign"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StartCampaign;
