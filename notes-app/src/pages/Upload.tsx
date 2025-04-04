//@ts-nocheck
import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Paper,
  ThemeIcon,
  AppShell,
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';
import { 
  IconUpload, 
  IconCheck, 
  IconX,
  IconFileUpload
} from '@tabler/icons-react';
import { ProgressBar } from '@tremor/react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import axiosClient from "../services/axiosInstance";
import { jwtDecode } from "jwt-decode";

export function UploadPage() {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handleDrop = (files: FileWithPath[]) => {
    setFile(files[0]);
    notifications.show({
      title: 'File selected',
      message: 'Ready to upload',
      color: 'blue',
      icon: <IconCheck size={16} />,
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    
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
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId); // Add the required user_id field
      
      // Send the correct content type and form data
      const response = await axiosClient.post('/pdf-extract', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });
      
      console.log('Upload response:', response.data);
      
      // For demo purposes if we don't have progress
      if (!progress) {
        for (let i = 0; i <= 100; i += 10) {
          setProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      notifications.show({
        title: 'Success',
        message: 'File uploaded successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      setFile(null);
      setProgress(0);
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.detail || 'Upload failed. Please try again.',
        color: 'red',
        icon: <IconX size={16} />,
      });
    } finally {
      setUploading(false);
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
          <Navigation />
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
                  className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3"
                >
                  Upload PDF Document
                </Title>
                <Text c="dimmed" size="lg" className="max-w-lg mx-auto">
                  Upload your PDF documents and turn them into interactive notes
                </Text>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Paper
                  radius="lg"
                  className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-xl p-0 overflow-hidden"
                >
                  {!file ? (
                    <Dropzone
                      onDrop={handleDrop}
                      accept={['application/pdf']}
                      maxSize={30 * 1024 ** 2}
                      className="border-0 bg-transparent"
                      h={400}
                    >
                      <Group className="h-full w-full"  align="center">
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                          className="flex flex-col items-center text-center px-8"
                        >
                          <ThemeIcon 
                            size={120} 
                            radius={100} 
                            className="bg-gradient-to-r from-violet-500 to-purple-500 shadow-xl mb-8"
                          >
                            <IconUpload size={60} stroke={1.5} />
                          </ThemeIcon>
                          <Text size="xl" fw={600} className="text-gray-700 mb-3">
                            Drag & Drop Your PDF Here
                          </Text>
                          <Text c="dimmed" size="md" className="mb-6 max-w-md">
                            Or click to select a file from your computer
                          </Text>
                          <Text className="text-violet-500 font-medium">
                            Maximum file size: 30MB
                          </Text>
                        </motion.div>
                      </Group>
                    </Dropzone>
                  ) : (
                    <div className="p-10">
                      <div className="flex items-center justify-between mb-8">
                        <Group>
                          <ThemeIcon size="xl" radius="md" className="bg-violet-100">
                            <IconFileUpload size={24} className="text-violet-500" />
                          </ThemeIcon>
                          <div>
                            <Text fw={600} size="lg">{file.name}</Text>
                            <Text size="sm" c="dimmed">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </div>
                        </Group>
                        <Button
                          variant="subtle"
                          color="red"
                          onClick={() => setFile(null)}
                          leftSection={<IconX size={16} />}
                        >
                          Remove
                        </Button>
                      </div>
                      
                      {uploading && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mb-8"
                        >
                          <ProgressBar value={progress} color="violet" className="mb-2" />
                          <Text size="sm" ta="center" className="text-violet-600 font-medium">
                            {progress}% Complete
                          </Text>
                        </motion.div>
                      )}
                      
                      <Button
                        fullWidth
                        size="lg"
                        loading={uploading}
                        onClick={handleUpload}
                        className="bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:shadow-violet-200/50 transition-all"
                      >
                        Upload PDF
                      </Button>
                    </div>
                  )}
                </Paper>
              </motion.div>
            </motion.div>
          </Container>
        </AppShell.Main>
      </AppShell>
    </div>
  );
} 