//@ts-nocheck

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { FaSun, FaMoon } from "react-icons/fa";
import GoogleIcon from "@mui/icons-material/Google";
import FloatingShapes from "../components/FloatingShapes";
import { ToastContainer, toast } from "react-toastify";

import "../styles/auth.css";
import axiosClient from "../services/axiosInstance";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import * as validator from "email-validator";

const firebaseConfig = {
  apiKey:process.env.FIREBASE_API_KEY, 
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export default function SignIn() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!validator.validate(email)) {
      setEmailError("Enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleLogin = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosClient.post("/login", { email, password });
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      toast.success("Welcome back! You've been logged in successfully.");

      navigate("/home");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
        "Login failed. Please check your credentials."
      );
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();
      const { data } = await axiosClient.post("/login/google", {
        firebase_token: firebaseToken,
      });

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      toast.success("logged in using google successfully!");

      navigate("/");
    } catch (error) {
      toast.error("Google sign-in failed. Please try again.");
      console.error("Google sign-in failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-gradient-bg auth-container">
      <FloatingShapes />
      
      <Button
        variant="outline"
        size="icon"
        className="theme-toggle"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <FaMoon /> : <FaSun />}
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-4 w-full max-w-md"
      >
        <Card className="auth-card">
          <CardHeader className="auth-header">
            <CardTitle className="auth-title">Welcome to Pratyaksha</CardTitle>
            <CardDescription className="auth-description">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="auth-content">
            <div className="auth-input-group">
              <Label htmlFor="email" className="auth-label">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "auth-input error" : "auth-input"}
              />
              {emailError && (
                <p className="auth-error-message">{emailError}</p>
              )}
            </div>
            
            <div className="auth-input-group">
              <Label htmlFor="password" className="auth-label">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "auth-input error" : "auth-input"}
              />
              {passwordError && (
                <p className="auth-error-message">{passwordError}</p>
              )}
            </div>
            
            <Button
              className="auth-button"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            
            <div className="auth-divider">
              <span className="auth-divider-text">Or continue with</span>
            </div>
            
            <Button
              variant="outline"
              className="auth-social-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon style={{ fontSize: 20 }} />
              <span>Google</span>
            </Button>
          </CardContent>
          
          <CardFooter className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
