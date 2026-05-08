import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../Services/apiConfig";
import ENDPOINTS from "../utils/endpoints";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ---------------- VALIDATION ----------------
  const validate = () => {
    let err = {};
    if (!formData.email) err.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = "Invalid email";

    if (!formData.password) err.password = "Password required";
    else if (formData.password.length < 6) err.password = "Min 6 characters";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`,
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("emailId", res.data.emailId);
        sessionStorage.setItem("userName", res.data.userName);
        navigate("/Chat");
      }
    } catch (err) {
      setMessage("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.GOOGLE_LOGIN}`,
        { Token: credentialResponse.credential },
        { withCredentials: true }
      );

      if (res.data.success) {
        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("emailId", res.data.emailId);
        sessionStorage.setItem("userName", res.data.userName);
        navigate("/Chat");
      }
    } catch (err) {
      setMessage("Google login failed");
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
        background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: 4,
          maxWidth: 420,
          width: "100%",
          borderRadius: 4,
          backgroundColor: "rgba(255,255,255,0.9)",
        }}
      >
        {/* Header */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#2575fc" }}
        >
          Welcome back
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          gutterBottom
          sx={{ color: "text.secondary" }}
        >
          Sign in to continue to AI Chat
        </Typography>

        {/* Google Login */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google login failed")}
          />
        </Box>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {/* Email */}
        <TextField
          label="Email"
          fullWidth
          variant="outlined"
          value={formData.email}
          error={!!errors.email}
          helperText={errors.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          sx={{ mb: 2 }}
        />

        {/* Password */}
        <TextField
          label="Password"
          fullWidth
          type={showPassword ? "text" : "password"}
          value={formData.password}
          error={!!errors.password}
          helperText={errors.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
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

        {/* Forgot */}
        <Typography
          variant="body2"
          sx={{
            cursor: "pointer",
            mb: 2,
            color: "#6a11cb",
            textAlign: "right",
          }}
        >
          Forgot password?
        </Typography>

        {/* Login Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            background: "linear-gradient(45deg, #ff6b6b, #f06595)",
            color: "#fff",
            fontWeight: "bold",
            py: 1.2,
            "&:hover": {
              background: "linear-gradient(45deg, #f06595, #ff6b6b)",
            },
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign in"}
        </Button>

        {message && (
          <Typography color="error" align="center" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}

        <Typography align="center" sx={{ mt: 2 }}>
          Don’t have an account?{" "}
          <Link to="/" style={{ color: "#2575fc", fontWeight: "bold" }}>
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
