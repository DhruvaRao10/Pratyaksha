//@ts-nocheck
import {
    Avatar,
    Box,
    Button,
    Container,
    CssBaseline,
    Typography,
} from "@mui/material";
import { LockOutlined } from "@mui/icons-material";
import Grid from '@mui/material/Grid2';
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import axiosClient from "../services/axiosInstance";

const API_BASE_URL = 'http://localhost:3000'; 

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        try {
            const payload = {
                username: name,
                email: email,
                password: pass
            };

            const response = await axiosClient.post(`/register`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("Registration successful", response.data);
        } catch (error) {
            setError(error.response?.data?.detail || "Registration failed");
            console.error("Registration error:", error.response?.data);
        }
    };
                
    return (    
        <>
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
                    <Typography variant="h5">Register</Typography>
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                    <Box sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid xs={12}>
                                <textarea
                                    style={{ width: '100%', padding: '8px' }}
                                    name="name"
                                    required
                                    id="name"
                                    placeholder="USERNAME"
                                    autoFocus
                                    value={name}
                                    rows={1} 
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Grid>

                            <Grid xs={12}>
                                <textarea
                                    style={{ width: '100%', padding: '8px' }}
                                    required
                                    id="email"
                                    name="email"
                                    placeholder="EMAIL ID"
                                    value={email}
                                    rows={1}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </Grid>
                            <Grid xs={12}>
                                <textarea
                                    style={{ width: '100%', padding: '8px' }}
                                    required
                                    name="pass"
                                    id="pass"
                                    type="password"
                                    placeholder="Enter Password"
                                    value={pass}
                                    rows={1} 
                                    onChange={(e) => setPass(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={handleRegister}
                        >
                            Register
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid>
                                <Link to="/login">Already have an account? Login</Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default Register;