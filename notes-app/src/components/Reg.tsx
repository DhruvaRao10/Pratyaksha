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
  
  const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const handleRegister = async () => {};
  
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
            <Box sx={{ mt: 3 }}>
              <Grid spacing={2}>
                <Grid >
                  <textarea
                    name="name"
                    required
                    id="name"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Grid>
  
                <Grid >
                  <textarea
                    required
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Grid>
                <Grid>
                  <textarea
                    required
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
  