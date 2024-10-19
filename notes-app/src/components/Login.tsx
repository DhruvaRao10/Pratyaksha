import React from "react"
import { LockOutlined } from "@mui/icons-material";
import {
    Container,
    CssBaseline,
    Box,
    Avatar,
    Typography,
    Button,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useState } from "react";
import { Link } from "react-router-dom";


const Login = () => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");

    const handleLogin = () => {

    }
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
                    <Avatar sx={{
                        m: 1,
                        bgcolor: "primary.light"
                    }}>
                        <LockOutlined />
                    </Avatar>
                    <Typography variant="h5">Login</Typography>
                    <Box sx={{ mt: 1 }}>
                        <textarea
                            minLength={10}
                            maxLength={40}
                            autoFocus={true}
                            required={true}
                            name="email"
                            value={email}
                            onChange={(email) => setEmail(email.target.value)}


                        />

                        <textarea
                            required
                            id="password"
                            name="password"
                            value={pass}
                            onChange={(pass) => {
                                setPass(pass.target.value);
                            }}
                        />
                        <Button
                            // fullWidth
                            // variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={handleLogin}
                        >
                        </Button>
                        <Grid container justifyContent={"flex-end"}>
                            <Grid>
                                <Link to="/register">Don't have an account? Register</Link>
                            </Grid>

                        </Grid>

                    </Box>

                </Box>
            </Container>
        </>
    ); 
}; 



export default Login
