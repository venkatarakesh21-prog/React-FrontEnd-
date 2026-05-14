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

  // ---------------- STATE ----------------
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  const [message, setMessage] = useState({
    text: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  // ---------------- MAX LENGTH ----------------
  const USERNAME_MAX = 20;
  const EMAIL_MAX = 50;
  const PASSWORD_MAX = 20;

  // ---------------- REGEX ----------------
  const usernameRegex =
    /^[a-zA-Z0-9_]{3,20}$/;

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  // ---------------- VALIDATION ----------------
  const validateField = (name, value) => {
    let error = "";

    // USERNAME
    if (name === "username") {
      if (!value.trim()) {
        error = "Username is required";
      } else if (value.length > USERNAME_MAX) {
        error = `Username max length is ${USERNAME_MAX}`;
      } else if (!usernameRegex.test(value)) {
        error =
          "3-20 chars using letters, numbers or _";
      }
    }

    // EMAIL
    if (name === "email") {
      if (!value.trim()) {
        error = "Email is required";
      } else if (value.length > EMAIL_MAX) {
        error = `Email max length is ${EMAIL_MAX}`;
      } else if (!emailRegex.test(value)) {
        error = "Enter valid email";
      }
    }

    // PASSWORD
    if (name === "password") {
      if (!value.trim()) {
        error = "Password is required";
      } else if (value.length > PASSWORD_MAX) {
        error = `Password max length is ${PASSWORD_MAX}`;
      } else if (!passwordRegex.test(value)) {
        error =
          "Min 6 chars with at least 1 letter & 1 number";
      }
    }

    return error;
  };

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // validate while typing AFTER touch
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

  // ---------------- HANDLE SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    let tempErrors = {};

    // touch all fields
    setTouched({
      username: true,
      email: true,
      password: true,
    });

    // validate all
    Object.keys(formData).forEach((key) => {
      const error = validateField(
        key,
        formData[key]
      );

      if (error) {
        tempErrors[key] = error;
      }
    });

    setErrors(tempErrors);

    // stop submit if errors
    if (Object.keys(tempErrors).length > 0) {
      return;
    }

    setLoading(true);

    setMessage({
      text: "",
      type: "",
    });

    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.AUTH.REGISTER}`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setMessage({
          text:
            res.data.message ||
            "Registration Successful",
          type: "success",
        });

        setFormData({
          username: "",
          email: "",
          password: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        setMessage({
          text:
            res.data.message ||
            "Registration failed",
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message ||
          "Registration failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleSuccess = async (
    credentialResponse
  ) => {
    setLoading(true);

    setMessage({
      text: "",
      type: "",
    });

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
        setMessage({
          text: "Google Login Successful!",
          type: "success",
        });

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

        setTimeout(() => {
          navigate("/Chat");
        }, 1200);
      } else {
        setMessage({
          text: res.data.message,
          type: "error",
        });
      }
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message ||
          "Google Login failed",
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
        background:
          "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
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
            "rgba(255,255,255,0.95)",
        }}
      >
        {/* HEADER */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#4a00e0",
          }}
        >
          Create Your Account
        </Typography>

        <Typography
          align="center"
          sx={{
            mb: 3,
            color: "text.secondary",
          }}
        >
          AI CHAT APP
        </Typography>

        {/* GOOGLE LOGIN */}
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
              setMessage({
                text: "Google Sign-In failed",
                type: "error",
              })
            }
          />
        </Box>

        <Divider sx={{ my: 2 }}>OR</Divider>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          {/* USERNAME */}
          <TextField
            label="Username"
            name="username"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.username &&
              !!errors.username
            }
            helperText={
              touched.username
                ? errors.username
                : ""
            }
            inputProps={{
              maxLength: USERNAME_MAX,
            }}
            sx={{ mb: 2 }}
          />

          {/* EMAIL */}
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.email && !!errors.email
            }
            helperText={
              touched.email ? errors.email : ""
            }
            inputProps={{
              maxLength: EMAIL_MAX,
            }}
            sx={{ mb: 2 }}
          />

          {/* PASSWORD */}
          <TextField
            label="Password"
            name="password"
            fullWidth
            type={
              showPassword ? "text" : "password"
            }
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={
              touched.password &&
              !!errors.password
            }
            helperText={
              touched.password
                ? errors.password
                : ""
            }
            inputProps={{
              maxLength: PASSWORD_MAX,
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

          {/* SUBMIT BUTTON */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              background:
                "linear-gradient(45deg, #8e2de2, #4a00e0)",
              color: "#fff",
              fontWeight: "bold",
              py: 1.2,

              "&:hover": {
                background:
                  "linear-gradient(45deg, #4a00e0, #8e2de2)",
              },
            }}
          >
            {loading ? (
              <CircularProgress
                size={22}
                sx={{ color: "#fff" }}
              />
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        {/* MESSAGE */}
        {message.text && (
          <Typography
            align="center"
            sx={{
              mt: 2,
              color:
                message.type === "error"
                  ? "error.main"
                  : "success.main",
              fontWeight: "bold",
            }}
          >
            {message.text}
          </Typography>
        )}

        {/* LOGIN LINK */}
        <Typography
          align="center"
          sx={{ mt: 2 }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#4a00e0",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Register;