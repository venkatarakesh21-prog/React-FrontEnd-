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

  // ---------------- STATE ----------------
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  // ---------------- VALIDATION ----------------

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value.trim()) {
          return "Email required";
        }

        if (value.length > 50) {
          return "Email max length is 50";
        }

        if (!/\S+@\S+\.\S+/.test(value)) {
          return "Invalid email";
        }

        return "";

      case "password":
        if (!value.trim()) {
          return "Password required";
        }

        if (value.length < 6) {
          return "Minimum 6 characters";
        }

        if (value.length > 20) {
          return "Password max length is 20";
        }

        return "";

      default:
        return "";
    }
  };

  // ---------------- FORM VALIDATION ----------------

  const validateForm = () => {
    let newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(
        key,
        formData[key]
      );

      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    // Make all fields touched on submit
    setTouched({
      email: true,
      password: true,
    });

    return Object.keys(newErrors).length === 0;
  };

  // ---------------- HANDLE CHANGE ----------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate while typing only if field touched
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  // ---------------- HANDLE BLUR ----------------

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  // ---------------- LOGIN ----------------

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    setMessage("");

    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.LOGIN}`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        sessionStorage.setItem(
          "userId",
          res.data.userId
        );

        sessionStorage.setItem(
          "emailId",
          res.data.emailId
        );

        sessionStorage.setItem(
          "userName",
          res.data.userName
        );

        navigate("/Chat");
      } else {
        setMessage(
          res.data.message || "Login failed"
        );
      }
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------

  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    setLoading(true);

    setMessage("");

    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.GOOGLE_LOGIN}`,
        {
          Token: credentialResponse.credential,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        sessionStorage.setItem(
          "userId",
          res.data.userId
        );

        sessionStorage.setItem(
          "emailId",
          res.data.emailId
        );

        sessionStorage.setItem(
          "userName",
          res.data.userName
        );

        navigate("/Chat");
      } else {
        setMessage(
          res.data.message ||
            "Google login failed"
        );
      }
    } catch (err) {
      setMessage(
        err?.response?.data?.message ||
          "Google login failed"
      );
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
        background:
          "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
        px: 2,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          p: 4,
          maxWidth: 420,
          width: "100%",
          borderRadius: 4,
          backgroundColor:
            "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}

        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#2575fc",
          }}
        >
          Welcome Back
        </Typography>

        <Typography
          variant="subtitle1"
          align="center"
          gutterBottom
          sx={{
            color: "text.secondary",
            mb: 3,
          }}
        >
          Sign in to continue to AI Chat
        </Typography>

        {/* Google Login */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              setMessage("Google login failed")
            }
          />
        </Box>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {/* Email */}

        <TextField
          label="Email"
          name="email"
          fullWidth
          variant="outlined"
          value={formData.email}
          error={!!errors.email}
          helperText={errors.email}
          onChange={handleChange}
          onBlur={handleBlur}
          inputProps={{
            maxLength: 50,
          }}
          sx={{ mb: 2 }}
        />

        {/* Password */}

        <TextField
          label="Password"
          name="password"
          fullWidth
          type={
            showPassword ? "text" : "password"
          }
          value={formData.password}
          error={!!errors.password}
          helperText={errors.password}
          onChange={handleChange}
          onBlur={handleBlur}
          inputProps={{
            maxLength: 20,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                >
                  {showPassword ? (
                    <VisibilityOff />
                  ) : (
                    <Visibility />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Forgot Password */}

        <Typography
          variant="body2"
          sx={{
            cursor: "pointer",
            mb: 2,
            color: "#6a11cb",
            textAlign: "right",
            fontWeight: 500,
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
            background:
              "linear-gradient(45deg, #ff6b6b, #f06595)",

            color: "#fff",

            fontWeight: "bold",

            py: 1.2,

            borderRadius: 2,

            textTransform: "none",

            fontSize: "1rem",

            "&:hover": {
              background:
                "linear-gradient(45deg, #f06595, #ff6b6b)",
            },
          }}
        >
          {loading ? (
            <CircularProgress
              size={22}
              sx={{ color: "#fff" }}
            />
          ) : (
            "Sign In"
          )}
        </Button>

        {/* Error Message */}

        {message && (
          <Typography
            color="error"
            align="center"
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}

        {/* Signup */}

        <Typography
          align="center"
          sx={{ mt: 3 }}
        >
          Don’t have an account?{" "}
          <Link
            to="/"
            style={{
              color: "#2575fc",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;