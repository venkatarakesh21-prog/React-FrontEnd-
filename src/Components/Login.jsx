import React, { useState } from "react";
import "./Login.css";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../Services/apiConfig";
import ENDPOINTS from "../utils/endpoints";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState({ text: "", type: "" }); // Updated state
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let hasError = false;
    if (name === "email") hasError = !value || !/\S+@\S+\.\S+/.test(value);
    if (name === "password") hasError = !value || value.length < 6;
    setErrors((prev) => ({ ...prev, [name]: hasError }));
  };

  const validateForm = () => {
    const emailError = !formData.email || !/\S+@\S+\.\S+/.test(formData.email);
    const passwordError = !formData.password || formData.password.length < 6;
    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });
    return !emailError && !passwordError;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`,
        formData,
      );
      if (response.data.success === true) {
        setMessage({ text: response.data.message, type: "success" }); // Success type
        sessionStorage.setItem("userId", response.data.userId);
        setTimeout(() => navigate("/Chat"), 1500);
      } else {
        setMessage({ text: response.data.message, type: "error" }); // Error type
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "❌ Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay">
      <div className="modal">
        <button className="close-btn">×</button>
        <div className="logo-section">
          <span className="logo-text">AI CHAT APP</span>
        </div>
        <h2 className="title">Log into your account</h2>

        <button className="google-btn" type="button">
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="google"
          />
          Continue with Google
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="form-container">
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            className={`input ${touched.email && errors.email ? "input-error" : ""}`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className={`input ${touched.password && errors.password ? "input-error" : ""}`}
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="current-password"
          />
          <div className="forgot">Forgot Password?</div>
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {/* Updated Message Display */}
        {message.text && (
          <div className={`api-message ${message.type}`}>{message.text}</div>
        )}

        <p className="signup-text">
          No account yet? <Link to="/">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
