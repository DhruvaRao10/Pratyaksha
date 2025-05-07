//@ts-nocheck
import { useState, useEffect } from 'react';
import { AppShell, Container, Title, Text, TextInput, Button, Paper, ThemeIcon } from '@mantine/core';
import { motion } from 'framer-motion';
import { MainNav } from '../components/Navigation';
import { IconBrandYoutube, IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import axiosClient from "../services/axiosInstance";
import { jwtDecode } from "jwt-decode";

export function YouTubePage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [userId, setUserId] = useState(null);

  // Get user ID from token on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.sub); // Assuming 'sub' field contains the user ID
        console.log('User ID from token:', decoded.sub);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const validateUrl = (url: string) => {
    // Simple validation for YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    if (!url) {
      setUrlError('Please enter a YouTube URL');
      return false;
    }
    if (!youtubeRegex.test(url)) {
      setUrlError('Please enter a valid YouTube URL');
      return false;
    }
    setUrlError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateUrl(youtubeUrl)) return;

    // Check if we have a user ID
    if (!userId) {
      notifications.show({
        title: 'Error',
        message: 'User ID not found. Please try logging in again.',
        color: 'red',
        icon: <IconX size={16} />,
      });
      return;
    }

    setLoading(true);
    try {
      // Make API call with correct payload format including user_id
      const response = await axiosClient.post('/video-extract', { 
        url: youtubeUrl,
        user_id: parseInt(userId) // Ensure user_id is sent as a number
      });
      
      console.log('YouTube processing response:', response.data);
      
      notifications.show({
        title: "Success",
        message: "YouTube video processing started",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      
      setYoutubeUrl('');
    } catch (error) {
      console.error("YouTube processing error:", error.response?.data || error);
      notifications.show({
        title: "Error",
        message: error.response?.data?.detail || "Failed to process YouTube video. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-50 via-white to-violet-50">
      {/* Animated background shapes */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="floating-shape bg-purple-500/5 w-[800px] h-[800px] rounded-full absolute -top-[400px] -right-[400px] blur-3xl"></div>
        <div className="floating-shape-delayed bg-blue-500/5 w-[600px] h-[600px] rounded-full absolute top-1/3 left-1/4 blur-3xl"></div>
        <div className="floating-shape bg-pink-500/5 w-[700px] h-[700px] rounded-full absolute -bottom-[300px] -left-[300px] blur-3xl"></div>
      </div>
    
      <AppShell
        padding="md"
        navbar={{
          width: 260,
          breakpoint: 'sm',
          collapsed: { mobile: false, desktop: false }
        }}
        className="bg-transparent"
      >
        <AppShell.Navbar>
          {/* <MainNav /> */}
        </AppShell.Navbar>
        
        <AppShell.Main className="content-with-sidebar transition-all duration-300">
          <Container size="md" py="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <Title
                  order={1}
                  className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-3"
                >
                  Import from YouTube
                </Title>
                <Text c="dimmed" size="lg" className="max-w-lg mx-auto">
                  Convert YouTube videos into interactive notes
                </Text>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Paper
                  radius="lg"
                  className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-xl p-10"
                >
                  <div className="flex flex-col items-center justify-center mb-10">
                    <ThemeIcon 
                      size={100} 
                      radius={100} 
                      className="bg-gradient-to-r from-pink-500 to-red-500 shadow-lg mb-6"
                    >
                      <IconBrandYoutube size={50} stroke={1.5} />
                    </ThemeIcon>
                    <Text size="xl" fw={500} className="text-gray-700">
                      Enter YouTube URL
                    </Text>
                  </div>
                  
                  <TextInput
                    placeholder="https://www.youtube.com/watch?v=..."
                    size="lg"
                    radius="md"
                    className="mb-6"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    error={urlError}
                    icon={<IconBrandYoutube size={18} className="text-red-500" />}
                  />
                  
                  <Button
                    fullWidth
                    size="lg"
                    loading={loading}
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-pink-600 to-red-600 hover:shadow-lg hover:shadow-pink-200/50 transition-all"
                  >
                    Process YouTube Video
                  </Button>
                  
                  <Text c="dimmed" size="sm" ta="center" mt={20}>
                    We'll extract audio, transcribe it, and turn it into notes
                  </Text>
                </Paper>
              </motion.div>
            </motion.div>
          </Container>
        </AppShell.Main>
      </AppShell>
    </div>
  );
} 