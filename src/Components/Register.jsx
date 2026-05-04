import React, { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../Services/apiConfig";
import ENDPOINTS from "../utils/endpoints";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
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
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempErrors = {};
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) tempErrors[key] = err;
    });
    
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, formData, { withCredentials: true });
      if (res.data.success) {
        setMessage(res.data.message);
        setIsError(false);
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
    <div className="register-page">
      <div className="register-card">
        <button className="close-btn" onClick={() => navigate("/")}>&times;</button>
        
        <div className="header-section">
          <div className="brand">AI CHAT APP</div>
          <h1>Create your account</h1>
        </div>

        <button className="google-signin" type="button">
          <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="G" />
          Continue with Google
        </button>

        <div className="separator"><span>OR</span></div>

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
              <button type="button" className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <span className="err-hint">{errors.password}</span>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        {message && (
          <div className={`status-alert ${isError ? "alert-error" : "alert-success"}`}>
            {message}
          </div>
        )}

        <p className="login-prompt">
          Already have an account? <Link to="/login" className="link-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;