import React, { useState } from "react";
import style from "./ForgetChangedPassword.module.css";
import toast from "react-hot-toast";
import { toastStyle } from "../../utils/toastStyles";
import api from "../../api/api";
import { ClipLoader } from "react-spinners";
import { useLocation, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon } from "../../icons";

const ForgetChangedPassword = () => {

  const navigate = useNavigate()
  const location = useLocation()
  const {state} = location


  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validatePassword = (value) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
  };

  const [changePasswordLoader, setChangePasswordLoader] = useState(false);

  const handleSubmit = async () => {
    let hasError = false;

    // Reset errors first
    setPasswordError("");
    setConfirmPasswordError("");

    // Password validations
    if (!password.trim()) {
      setPasswordError("Password is required");
      hasError = true;
    } else if (!validatePassword(password)) {
      setPasswordError(
        "Password must be at least 8 chars long & contain uppercase, lowercase, and a number"
      );
      hasError = true;
    }

    // Confirm password validations
    if (!confirmPasswordValue.trim()) {
      setConfirmPasswordError("Confirm Password is required");
      hasError = true;
    } else if (password !== confirmPasswordValue) {
      setConfirmPasswordError("Passwords do not match");
      hasError = true;
    }

    if (hasError) return;

    try {
      setChangePasswordLoader(true);
      const { data } = await api.post(`/change-password/${state.resetToken}`, {
        password,
      });

      if (data.code === 200) {
        toast.success(data.message, {
          duration: 3000,
          style: toastStyle,
        });
        navigate("/login-signup");
      } else {
        toast.error(data.message, { duration: 3000, style: toastStyle });
      }
    } catch (error) {
      toast.error("Forget password failed", {
        duration: 3000,
        style: toastStyle,
      });
    } finally {
      setChangePasswordLoader(false);
    }
  };

  return (
    <main className={style.authContainer}>
      <div>
        <div>
          <h2>Change Password</h2>

          {/* Password */}
          <div>
            <label>Password</label>
            <div className={style.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={style.iconButton}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="input-error-message">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label>Confirm Password</label>
            <div className={style.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPasswordValue}
                onChange={(e) => setConfirmPasswordValue(e.target.value)}
              />
              <button
                type="button"
                className={style.iconButton}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-pressed={showConfirmPassword}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="input-error-message">{confirmPasswordError}</p>
            )}
          </div>

          <button onClick={handleSubmit}>
            {changePasswordLoader ? (
              <ClipLoader
                color="#fff"
                size={"3rem"}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </main>
  );
};

export default ForgetChangedPassword;
