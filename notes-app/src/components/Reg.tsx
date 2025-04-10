//@ts-nocheck

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, TextInput, PasswordInput, Button, Title, Text, Paper, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconUser, IconAt, IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";
import axiosClient from "../services/axiosInstance";

const Register = () => {
    const navigate = useNavigate();
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
                        Create Account
                    </Title>
                    <Text c="dimmed" size="sm" align="center" mb={30}>
                        Join Intuit Notes and start organizing your thoughts
                    </Text>

                    <Paper withBorder shadow="md" p={30} radius="md" className="bg-white/80 backdrop-blur-lg">
                        <TextInput
                            label="Username"
                            placeholder="Your username"
                            icon={<IconUser size={16} />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={nameError}
                            required
                            mb="md"
                        />
                        
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
                            placeholder="Create a password"
                            icon={<IconLock size={16} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={passwordError}
                            required
                            mb="md"
                            visibilityToggleIcon={({ reveal, size }) =>
                                reveal ? <IconEyeOff size={size} /> : <IconEye size={size} />
                            }
                        />

                        <Button
                            fullWidth
                            loading={loading}
                            onClick={handleRegister}
                            className="bg-gradient-to-r from-violet-600 to-purple-600"
                            mt="xl"
                        >
                            Create Account
                        </Button>

                        <Text align="center" mt="md">
                            Already have an account?{" "}
                            <Text component={Link} to="/login" className="text-violet-600 hover:text-violet-700">
                                Sign in
                            </Text>
                        </Text>
                    </Paper>
                </motion.div>
            </Container>
        </div>
    );
};

export default Register;