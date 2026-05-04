import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../Services/apiConfig";
import ENDPOINTS from "../utils/endpoints";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  const validateField = (name, value) => {
    let error = "";
    if (name === "username") {
      if (!value) error = "Username is required";
      else if (!usernameRegex.test(value))
        error = "3-20 chars, letters, numbers, underscore only";
    }
    if (name === "email") {
      if (!value) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Enter a valid email";
    }
    if (name === "password") {
      if (!value) error = "Password is required";
      else if (!passwordRegex.test(value))
        error = "Min 6 chars, include letter & number";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const validate = () => {
    let temp = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) temp[key] = err;
    });
    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.REGISTER}`,
        formData,
      );

      if (res.data.success) {
        setMessage(res.data.message);
        setIsError(false);
        setFormData({ username: "", email: "", password: "" });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMessage(res.data.message);
        setIsError(true);
      }
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="register-box">
        <div className="header-content">
          <div className="logo-text">AI Chat App</div>
          <h1>Create your account</h1>
        </div>

        <button className="google-btn" type="button">
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="google"
          />
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={
                errors.username
                  ? "input-error"
                  : formData.username
                    ? "input-valid"
                    : ""
              }
            />
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className={
                errors.email
                  ? "input-error"
                  : formData.email
                    ? "input-valid"
                    : ""
              }
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={
                  errors.password
                    ? "input-error"
                    : formData.password
                      ? "input-valid"
                      : ""
                }
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M1 1l22 22" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </span>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {message && (
          <div
            className={`status-msg ${isError ? "msg-error" : "msg-success"}`}
          >
            {message}
          </div>
        )}

        <p className="footer-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
