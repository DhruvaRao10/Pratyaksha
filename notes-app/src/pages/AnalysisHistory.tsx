//@ts-nocheck
import { useState, useEffect } from 'react';
import { AppShell, Container, Title, Text, Paper, Group, ThemeIcon, Card, Badge, Accordion, Loader, Center } from '@mantine/core';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { IconHistory, IconFile, IconFileText, IconAnalyze } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { jwtDecode } from "jwt-decode";
import { fetchUserAnalysisHistory } from '../services/analysisService';

export function AnalysisHistoryPage() {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // Get user ID from token on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.sub);
      } catch (error) {
        console.error('Error decoding token:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to get user information. Please try logging in again.',
          color: 'red',
        });
      }
    }
  }, []);

  // Fetch analysis history when userId is available
  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const historyData = await fetchUserAnalysisHistory(userId);
      setAnalysisHistory(historyData);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch analysis history. Please try again later.',
        color: 'red',
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
          <Navigation />
        </AppShell.Navbar>
        
        <AppShell.Main className="content-with-sidebar transition-all duration-300">
          <Container size="xl" py="xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex justify-between items-center">
                <div>
                  <Title
                    order={1}
                    className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
                  >
                    Analysis History
                  </Title>
                  <Text c="dimmed" mt="md" size="lg">
                    Your previous document analyses and insights
                  </Text>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Paper
                  radius="lg"
                  className="bg-white/90 backdrop-blur-xl border border-gray-100 shadow-xl p-8"
                >
                  {loading ? (
                    <Center py="xl">
                      <Loader color="violet" size="lg" />
                    </Center>
                  ) : analysisHistory.length === 0 ? (
                    <Card shadow="sm" p="xl" radius="md" withBorder>
                      <Text fw={500} align="center" size="lg" py="md">
                        No analysis history found. Try uploading a document first!
                      </Text>
                    </Card>
                  ) : (
                    <Accordion variant="separated">
                      {analysisHistory.map((item, index) => (
                        <Accordion.Item key={index} value={item.doc_id}>
                          <Accordion.Control icon={
                            <ThemeIcon variant="light" size="lg" color="violet" radius="md">
                              <IconFileText size={20} />
                            </ThemeIcon>
                          }>
                            <Group>
                              <div>
                                <Text fw={500}>{item.file_name}</Text>
                                <Text size="sm" color="dimmed">
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </Text>
                              </div>
                              <Badge color="violet" variant="light">Document</Badge>
                            </Group>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Paper withBorder p="md" radius="md" bg="gray.0">
                              <Text component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                                {item.analysis}
                              </Text>
                            </Paper>
                          </Accordion.Panel>
                        </Accordion.Item>
                      ))}
                    </Accordion>
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