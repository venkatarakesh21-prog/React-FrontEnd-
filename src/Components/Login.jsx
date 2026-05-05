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

    if (errors[name]) {
      const updated = { ...errors };
      delete updated[name];
      setErrors(updated);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email";
    }

    if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 6) error = "Minimum 6 characters";
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`,
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        setMessage({ text: "Login Successful!", type: "success" });

        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("emailId", res.data.emailId);
        sessionStorage.setItem("userName", res.data.userName);

        setTimeout(() => navigate("/Chat"), 1200);
      } else {
        setMessage({ text: res.data.message, type: "error" });
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Login failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <button className="login-close">×</button>

        <div className="login-logo">AI CHAT APP</div>
        <h2 className="login-title">Log into your account</h2>

        <button className="login-google">
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="google"
          />
          Continue with Google
        </button>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="login-form">
          {/* EMAIL */}
          <div className="login-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`login-input ${
                touched.email && errors.email ? "input-error" : ""
              }`}
            />
            {touched.email && errors.email && (
              <span className="login-error">{errors.email}</span>
            )}
          </div>

          {/* PASSWORD */}
          <div className="login-group">
            <div className="login-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`login-input ${
                  touched.password && errors.password ? "input-error" : ""
                }`}
              />
              <button
                type="button"
                className="login-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {touched.password && errors.password && (
              <span className="login-error">{errors.password}</span>
            )}
          </div>

          <div className="login-forgot">Forgot password?</div>

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        {message.text && (
          <div className={`login-message ${message.type}`}>{message.text}</div>
        )}

        <p className="login-footer">
          Don’t have an account? <Link to="/">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
