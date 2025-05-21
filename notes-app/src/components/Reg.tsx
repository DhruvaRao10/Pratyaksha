//@ts-nocheck

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { FaSun, FaMoon } from "react-icons/fa";
import FloatingShapes from "../components/FloatingShapes";
import { toast } from "react-toastify";
import axiosClient from "../services/axiosInstance";
import "../styles/auth.css";

const Register = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const validateForm = () => {
        let isValid = true;

        if (!name.trim()) {
            setNameError("Username is required");
            isValid = false;
        } else {
            setNameError("");
        }

        if (!email.trim()) {
            setEmailError("Email is required");
            isValid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            setEmailError("Please enter a valid email");
            isValid = false;
        } else {
            setEmailError("");
        }

        if (!password) {
            setPasswordError("Password is required");
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters");
            isValid = false;
        } else {
            setPasswordError("");
        }

        return isValid;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                username: name,          
                email: email,
                password: password               
            };                   

            const response = await axiosClient.post(`/register`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            toast.success("Your account has been created successfully!");
            
            console.log("Registration successful", response.data);
            navigate("/login");
        } catch (error) {
            toast.error(error.response?.data?.detail || "Registration failed. Please try again.");
            console.error("Registration error:", error.response?.data);
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
                        <CardTitle className="auth-title">
                            Create Account
                        </CardTitle>
                        <CardDescription className="auth-description">
                            Join Pratyaksha and start organizing your research
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="auth-content">
                        <div className="auth-input-group">
                            <Label htmlFor="username" className="auth-label">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Your username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={nameError ? "auth-input error" : "auth-input"}
                            />
                            {nameError && <p className="auth-error-message">{nameError}</p>}
                        </div>
                        <div className="auth-input-group">
                            <Label htmlFor="email" className="auth-label">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={emailError ? "auth-input error" : "auth-input"}
                            />
                            {emailError && <p className="auth-error-message">{emailError}</p>}
                        </div>
                        <div className="auth-input-group">
                            <Label htmlFor="password" className="auth-label">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={passwordError ? "auth-input error" : "auth-input"}
                            />
                            {passwordError && <p className="auth-error-message">{passwordError}</p>}
                        </div>
                        <Button
                            className="auth-button"
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </Button>
                    </CardContent>
                    <CardFooter className="auth-footer">
                        <p className="auth-footer-text">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="auth-link"
                            >
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default Register;