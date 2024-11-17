//@ts-nocheck
import React, { useState } from "react";
import { LockOutlined, Google } from "@mui/icons-material";
import {
    Container,
    CssBaseline,
    Box,
    Avatar,
    Typography,
    Button,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import validator from 'validator';
import axiosClient from "../services/axiosInstance";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";




const firebaseConfig = {
  apiKey: "AIzaSyBO6hVXLPNSv7_6UHu_3_z4Q18JIPXwEIE",
  authDomain: "intuitnote-2342a.firebaseapp.com",
  projectId: "intuitnote-2342a",
  storageBucket: "intuitnote-2342a.appspot.com",
  messagingSenderId: "530910917968",
  appId: "1:530910917968:web:05e9209338d22cd198a855",
  measurementId: "G-R4ML705ZJ7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const googleprovider = new GoogleAuthProvider();





const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (e) => {
        const email = e.target.value;
        if (validator.isEmail(email)) {
            setEmailError("");
            return true;
        } else {
            setEmailError("Enter valid Email!");
            return false;
        }
    };

    const togglePass = () => {
        setShowPass(prev => !prev);
    };

    const setAuthTokens = (access_token, refresh_token) => {
        // Store tokens
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        // Verify tokens were stored
        const storedAccessToken = localStorage.getItem('access_token');
        const storedRefreshToken = localStorage.getItem('refresh_token');
        
        if (!storedAccessToken || !storedRefreshToken) {
            throw new Error('Failed to store authentication tokens');
        }
    };

    const handleLogin = async () => {
        try {
            if (!validateEmail({ target: { value: email } })) {
                return;
            }

            const payload = {
                email: email,
                password: pass
            };

            const response = await axiosClient.post('/login', payload);
            
            if (response.data && response.data.access_token && response.data.refresh_token) {
                // Store tokens
                setAuthTokens(response.data.access_token, response.data.refresh_token);
                
                // Verify token storage before navigation
                const verifyToken = localStorage.getItem('access_token');
                if (!verifyToken) {
                    throw new Error('Token storage failed');
                }
                
                console.log("Login successful - Token stored:", !!verifyToken);
                navigate('/home');
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (err) {
            console.error("Login error details:", err);
            if (err.response) {
                setError(err.response.data.detail || "Login failed");
            } else if (err.request) {
                setError("No response from server. Please try again.");
            } else {
                setError(`Authentication error: ${err.message}`);
            }
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleprovider);
            const user = result.user;
            
            const firebaseToken = await user.getIdToken();
            
            const response = await axiosClient.post('/login/google', {
                firebase_token: firebaseToken
            });
            
            if (response.data && response.data.access_token && response.data.refresh_token) {
                // Store tokens
                setAuthTokens(response.data.access_token, response.data.refresh_token);
                
                // Verify token storage before navigation
                const verifyToken = localStorage.getItem('access_token');
                if (!verifyToken) {
                    throw new Error('Token storage failed');
                }
                
                console.log("Google login successful - Token stored:", !!verifyToken);
                navigate('/home');
            } else {
                throw new Error('Invalid response format from server');
            }
            
        } catch (error) {
            console.error("Google sign-in error details:", error);
            setError(`Google sign-in failed: ${error.message}`);
        }
    };
    
    return (
        <Container maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    mt: 20,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
                    <LockOutlined />
                </Avatar>
                <Typography variant="h5">Login</Typography>
                <Box sx={{ mt: 1, width: '100%' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <input
                            style={{ 
                                width: '100%',
                                padding: '8px',
                                marginBottom: '4px'
                            }}
                            type="email"
                            name="email"
                            placeholder="Enter Email ID"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                validateEmail(e);
                            }}
                        />
                        {emailError && (
                            <Typography variant="caption" color="error">
                                {emailError}
                            </Typography>
                        )}
                    </div>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input
                            style={{ 
                                width: '100%',
                                padding: '8px',
                                paddingRight: '40px'
                            }}
                            type={showPass ? "text" : "password"}
                            name="password"
                            placeholder="Enter your password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                        />
                        <button
                            onClick={togglePass}
                            type="button"
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    {error && (
                        <Typography 
                            color="error" 
                            sx={{ mb: 2 }}
                        >
                            {error}
                        </Typography>
                    )}
                <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleLogin}
                >
                    Login
                </Button>
                
                <Grid 
                    container 
                    direction="column" 
                    alignItems="center" 
                    spacing={2}
                >
                    <Grid>
                        <Link to="/register">Don't have an account? Register</Link>
                    </Grid>
                    <Grid>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, mb: 1 }}>
                            OR
                        </Typography>
                        <Button
                            variant="outlined"
                            sx={{
                                borderRadius: '50%',
                                width: '48px',
                                height: '48px',
                                minWidth: '48px',
                                padding: '12px'
                            }}
                            onClick={handleGoogleSignIn}
                        >
                            <Google />
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    </Container>
);
};

export default Login;