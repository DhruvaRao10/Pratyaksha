//@ts-nocheck

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
// import { Icons } from "@/components/ui/icons";
import { notifications } from "@mantine/notifications";
import axiosClient from "../services/axiosInstance";

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
            
            notifications.show({
                title: "Success",
                message: "Your account has been created successfully!",
                color: "green"
            });
            
            console.log("Registration successful", response.data);
            navigate("/login");
        } catch (error) {
            notifications.show({
                title: "Error",
                message: error.response?.data?.detail || "Registration failed. Please try again.",
                color: "red"
            });
            console.error("Registration error:", error.response?.data);
        } finally {
            setLoading(false);
        }
    };
                
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Animated background shapes */}
            <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                <div className="floating-shape w-[600px] h-[600px] rounded-full absolute -top-[300px] -right-[300px] blur-3xl bg-purple-500/5 dark:bg-violet-900/10"></div>
                <div className="floating-shape-delayed w-[500px] h-[500px] rounded-full absolute -bottom-[250px] -left-[250px] blur-3xl bg-blue-500/5 dark:bg-indigo-900/10"></div>
            </div>
            
            {/* Theme toggle */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                {/* {theme === "dark" ? <Icons.sun className="h-5 w-5" /> : <Icons.moon className="h-5 w-5" />} */}
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
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-center">
                            Join Intuit Notes and start organizing your thoughts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Your username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={nameError ? "border-red-500" : ""}
                            />
                            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
                        </div>
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
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={passwordError ? "border-red-500" : ""}
                            />
                            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        </div>
                        <Button
                            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90"
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            {/* {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />} */}
                            Create Account
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <p className="text-center text-sm text-muted-foreground w-full">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
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