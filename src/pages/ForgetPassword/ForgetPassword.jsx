import React, { useState } from "react";
import style from "./ForgetPassword.module.css";
import toast from "react-hot-toast";
import { toastStyle } from "../../utils/toastStyles";
import api from "../../api/api";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const ForgetPassword = () => {

  const navigate = useNavigate()
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const [forgetPasswordLoader, setForgetPasswordLoader] = useState(false);

  const ForgetPassword = async () => {
    let hasError = false;

    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      hasError = true;
    }

    if (hasError) return;

    try {
      setForgetPasswordLoader(true);
      const { data } = await api.post("/forget-password", {
        email,
      });

      if (data.code === 200) {
        toast.success(data.message, {
          duration: 3000,
          style: toastStyle,
        });
        navigate("/forget-changepassword", {
          state: {
            resetLink: data?.data?.resetlink,
            resetToken: data?.data?.resetToken,
            useremail: email
          }
        })
      } else {
        toast.error(data.message, { duration: 3000, style: toastStyle });
      }
    } catch (error) {
      toast.error("Forget password failed", {
        duration: 3000,
        style: toastStyle,
      });
    } finally {
      setForgetPasswordLoader(false);
    }
  };

  return (
    <main className={style.authContainer}>
      <div>
        <div>
          <h2>Forget Password</h2>

          <div>
            <label>Email</label>
            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {emailError && <p className="input-error-message">{emailError}</p>}
          </div>

          <button
            className="btn-3d btn-3d--primary"
            disabled={forgetPasswordLoader}
            onClick={ForgetPassword}
          >
            {forgetPasswordLoader ? (
              <ClipLoader
                color="#fff"
                size={"3rem"}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ForgetPassword;
