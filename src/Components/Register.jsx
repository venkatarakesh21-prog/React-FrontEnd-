import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../Services/apiConfig";
import ENDPOINTS from "../utils/endpoints";
import { GoogleLogin } from "@react-oauth/google";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const validateField = (name, value) => {
    let error = "";
    if (name === "username") {
      if (!value) error = "Username is required";
      else if (!usernameRegex.test(value)) error = "3-20 chars (letters/numbers)";
    }
    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Enter a valid email";
    }
    if (name === "password") {
      if (!value) error = "Password is required";
      else if (!passwordRegex.test(value)) error = "Min 6 chars, letter & number";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) tempErrors[key] = err;
    });

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.REGISTER}`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage({ text: res.data.message, type: "success" });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage({ text: res.data.message, type: "error" });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Registration failed",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.GOOGLE_LOGIN}`,
        { Token: credentialResponse.credential },
        { withCredentials: true }
      );

      if (res.data.success) {
        setMessage({ text: "Google Login Successful!", type: "success" });
        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("emailId", res.data.emailId);
        sessionStorage.setItem("userName", res.data.userName);
        setTimeout(() => navigate("/Chat"), 1200);
      } else {
        setMessage({ text: res.data.message, type: "error" });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Google Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <button className="close-btn" onClick={() => navigate("/")}>
          &times;
        </button>

        <div className="header-section">
          <div className="brand">AI CHAT APP</div>
          <h1>Create your account</h1>
        </div>

        {/* CUSTOM BLUE GOOGLE PILL */}
        <div className="google-pill-container">
          {/* Visual Layer */}
          <div className="google-pill-visual">
            <div className="google-logo-circle">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <span className="google-text">Sign in with Google</span>
          </div>

          {/* Functional Ghost Layer */}
          <div className="google-hidden-layer">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage({ text: "Google Sign-In failed", type: "error" })}
              shape="pill"
              width="340px" 
            />
          </div>
        </div>

        <div className="separator">
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "input-err" : ""}
            />
            {errors.username && <span className="err-hint">{errors.username}</span>}
          </div>

          <div className="field-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-err" : ""}
            />
            {errors.email && <span className="err-hint">{errors.email}</span>}
          </div>

          <div className="field-group">
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "input-err" : ""}
              />
              <button
                type="button"
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <span className="err-hint">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        {message.text && (
          <div className={`status-alert ${message.type === "error" ? "alert-error" : "alert-success"}`}>
            {message.text}
          </div>
        )}

        <p className="login-prompt">
          Already have an account?{" "}
          <Link to="/login" className="link-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;