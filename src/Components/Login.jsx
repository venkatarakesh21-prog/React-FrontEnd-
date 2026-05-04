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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let errorMsg = "";
    if (name === "email") {
      if (!value) errorMsg = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) errorMsg = "Please enter a valid email";
    }
    if (name === "password") {
      if (!value) errorMsg = "Password is required";
      else if (value.length < 6) errorMsg = "Password must be at least 6 characters";
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password too short";

    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`,
        formData,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setMessage({ text: response.data.message || "Login Successful!", type: "success" });
        sessionStorage.setItem("userId", response.data.userId);
        sessionStorage.setItem("emailId", response.data.emailId);
        sessionStorage.setItem("userName", response.data.userName);
        setTimeout(() => navigate("/Chat"), 1500);
      } else {
        setMessage({ text: response.data.message, type: "error" });
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || "❌ Login failed. Please try again.",
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
          {/* Email Group */}
          <div className="input-group">
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
            {touched.email && errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Password Group */}
          <div className="input-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                className={`input ${touched.password && errors.password ? "input-error" : ""}`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="current-password"
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            {touched.password && errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="forgot">Forgot Password?</div>
          
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

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