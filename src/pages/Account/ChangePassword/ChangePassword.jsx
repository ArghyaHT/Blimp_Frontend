import React, { useState } from "react";
import styles from "./ChangePassword.module.css";
import { EyeIcon, EyeOffIcon } from "../../../icons";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/api";
import toast from "react-hot-toast";
import { toastStyle } from "../../../utils/toastStyles";
import { ClipLoader } from "react-spinners";

const ChangePassword = () => {

  const {
    userId
  } = useAuth()

  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [newPasswordError, setNewPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [updatePasswordLoader, setUpdatePasswordLoader] = useState(false)

  const validatePassword = (password) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const updatePassword = async () => {
    let hasError = false

    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setNewPasswordError("")
    setConfirmPasswordError("")

    if (!newPassword.trim()) {
      setNewPasswordError("Please enter your new password")
      hasError = true
    } else if (!validatePassword(newPassword)) {
      setNewPasswordError(
        "Password must be at least 8 characters long and contain uppercase, lowercase, and a number"
      );
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError("Please confirm your new password")
      hasError = true
    } else if (!validatePassword(confirmPassword)) {
      setConfirmPasswordError(
        "Password must be at least 8 characters long and contain uppercase, lowercase, and a number"
      );
      hasError = true;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setConfirmPasswordError("New password and confirm password do not match")
      hasError = true
    }

    if (hasError) return

    try {

      setUpdatePasswordLoader(true)

      const { data } = await api.post("/change-password", {
        user_id: Number(userId),
        password: newPassword
      });

      if (data.code === 200) {
        toast.success(data?.message, { duration: 3000, style: toastStyle });

        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error("Error while sending", { duration: 3000, style: toastStyle });
      }

    } catch (error) {
      toast.error("Something went wrong. Please try again.", { duration: 3000, style: toastStyle });
    } finally {
      setUpdatePasswordLoader(false)
    }

  }

  return (
    <div className={styles.ChangePasswordContainer}>

      <div className={styles.inputGroup}>
        <label htmlFor="">New Password</label>
        <div>
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setShowNewPassword(prev => !prev)}
            aria-pressed={showNewPassword}
            aria-label={showNewPassword ? "Hide password" : "Show password"}
          >
            {showNewPassword
              ? <EyeOffIcon className={styles.editIcon} aria-hidden="true" />
              : <EyeIcon className={styles.editIcon} aria-hidden="true" />}
          </button>
        </div>

        {newPasswordError && (
          <p className="input-error-message">{newPasswordError}</p>
        )}
      </div>


      <div className={styles.inputGroup}>
        <label htmlFor="">Confirm Password</label>
        <div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setShowConfirmPassword(prev => !prev)}
            aria-pressed={showConfirmPassword}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword
              ? <EyeOffIcon className={styles.editIcon} aria-hidden="true" />
              : <EyeIcon className={styles.editIcon} aria-hidden="true" />}
          </button>
        </div>

        {confirmPasswordError && (
          <p className="input-error-message">{confirmPasswordError}</p>
        )}
      </div>

      <button
        className={styles.updateBtn}
        disabled={updatePasswordLoader}
        onClick={updatePassword}
      >{updatePasswordLoader ? <ClipLoader
        color="#fff"
        size={"2rem"}
        aria-label="Loading Spinner"
        data-testid="loader"
      /> : "Update"}</button>

    </div>
  );
};

export default ChangePassword;
