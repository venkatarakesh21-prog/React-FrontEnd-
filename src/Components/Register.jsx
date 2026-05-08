import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
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
    password: "",
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
      [name]: validateField(name, value),
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
        type: "error",
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", // Deep blue background
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: 4,
          maxWidth: 420,
          width: "100%",
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.95)",
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#4a00e0" }}
        >
          Create Your Account
        </Typography>
        <Typography align="center" sx={{ mb: 3, color: "text.secondary" }}>
          AI CHAT APP
        </Typography>

        {/* Google Login */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setMessage({ text: "Google Sign-In failed", type: "error" })
            }
          />
        </Box>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            variant="outlined"
            value={formData.username}
            error={!!errors.username}
            helperText={errors.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            error={!!errors.email}
            helperText={errors.email}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Password"
            name="password"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={formData.password}
            error={!!errors.password}
            helperText={errors.password}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              background: "linear-gradient(45deg, #8e2de2, #4a00e0)", // Purple gradient
              color: "#fff",
              fontWeight: "bold",
              py: 1.2,
              "&:hover": {
                background: "linear-gradient(45deg, #4a00e0, #8e2de2)",
              },
            }}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Create account"}
          </Button>
        </form>

        {message.text && (
          <Typography
            align="center"
            sx={{
              mt: 2,
              color: message.type === "error" ? "error.main" : "success.main",
              fontWeight: "bold",
            }}
          >
            {message.text}
          </Typography>
        )}

        <Typography align="center" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#4a00e0", fontWeight: "bold" }}>
            Log in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;
