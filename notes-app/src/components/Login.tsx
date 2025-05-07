//@ts-nocheck

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { FaSun, FaMoon } from "react-icons/fa";
import GoogleIcon from '@mui/icons-material/Google';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';


import { notifications } from "@mantine/notifications";
import axiosClient from "../services/axiosInstance";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeApp } from "firebase/app";
import * as validator from 'email-validator';

const firebaseConfig = {
  apiKey: "AIzaSyBO6hVXLPNSv7_6UHu_3_z4Q18JIPXwEIE",
  authDomain: "intuitnote-2342a.firebaseapp.com",
  projectId: "intuitnote-2342a",
  storageBucket: "intuitnote-2342a.firebasestorage.app",
  messagingSenderId: "530910917968",
  appId: "1:530910917968:web:05e9209338d22cd198a855",
  measurementId: "G-R4ML705ZJ7"
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
      
      notifications.show({
        title: "Success",
        message: "Welcome back! You've been logged in successfully.",
        color: "green"
      });
      
      navigate("/home");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.detail || "Login failed. Please check your credentials.",
        color: "red"
      });
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
      const { data } = await axiosClient.post("/login/google", { firebase_token: firebaseToken });
      
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      
      notifications.show({
        title: "Success",
        message: "Successfully signed in with Google",
        color: "green"
      });
      
      navigate("/");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Google sign-in failed. Please try again.",
        color: "red"
      });
      console.error("Google sign-in failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="floating-shape w-[600px] h-[600px] rounded-full absolute -top-[300px] -right-[300px] blur-3xl bg-purple-500/5 dark:bg-violet-900/10"></div>
        <div className="floating-shape-delayed w-[500px] h-[500px] rounded-full absolute -bottom-[250px] -left-[250px] blur-3xl bg-blue-500/5 dark:bg-indigo-900/10"></div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? < FaMoon/> : <FaSun/>} 
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-4"
      >
        <Card className="backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-gray-200 dark:border-gray-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to Pratyaksha
            </CardTitle>
            <CardDescription className="text-center">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
            <Button
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90"
              onClick={handleLogin}
              disabled={loading}
            >
              Sign In
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon/>
              Google
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}