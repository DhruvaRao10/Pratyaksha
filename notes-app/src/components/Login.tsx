//@ts-nocheck

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, TextInput, PasswordInput, Button, Title, Text, Paper, Divider, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAt, IconLock, IconBrandGoogle } from "@tabler/icons-react";
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
      
      navigate("/");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating-shape bg-purple-500/5 w-96 h-96 rounded-full absolute -top-48 -right-48 blur-3xl"></div>
        <div className="floating-shape-delayed bg-blue-500/5 w-96 h-96 rounded-full absolute -bottom-48 -left-48 blur-3xl"></div>
      </div>
      
      <Container size={420} py={40}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title order={1} align="center" className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </Title>
          <Text c="dimmed" size="sm" align="center" mb={30}>
            Sign in to your Intuit Notes account
          </Text>

          <Paper withBorder shadow="md" p={30} radius="md" className="bg-white/80 backdrop-blur-lg">
            <TextInput
              label="Email"
              placeholder="you@example.com"
              icon={<IconAt size={16} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={emailError}
              required
              mb="md"
            />
            
            <PasswordInput
              label="Password"
              placeholder="Your password"
              icon={<IconLock size={16} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={passwordError}
              required
              mb="md"
            />

            <Button
              fullWidth
              loading={loading}
              onClick={handleLogin}
              className="bg-gradient-to-r from-violet-600 to-purple-600"
              mt="xl"
            >
              Sign in
            </Button>

            <Divider label="or continue with" labelPosition="center" my="lg" />

            <Group grow>
              <Button
                leftSection={<IconBrandGoogle size={18} />}
                variant="default"
                className="hover:bg-gray-100"
                onClick={handleGoogleSignIn}
                loading={loading}
              >
                Google
              </Button>
            </Group>

            <Text align="center" mt="md">
              Don't have an account?{" "}
              <Text component={Link} to="/register" className="text-violet-600 hover:text-violet-700">
                Register
              </Text>
            </Text>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}