//@ts-nocheck
import { AppShell, Container, Title, Text, Paper, ActionIcon, Button, ThemeIcon, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Card, Metric, ProgressBar } from '@tremor/react';
import { IconFileText, IconBrandYoutube, IconPlus, IconSearch, IconUpload, IconClock } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();

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
                    Welcome to Notes App
                  </Title>
                  <Text c="dimmed" mt="md" size="lg">
                    Transform your content into interactive notes
                  </Text>
                </div>
                
                <Group>
                  <ActionIcon variant="light" size="lg" radius="xl" className="bg-white shadow-sm hover:scale-105 transition-transform">
                    <IconSearch size={20} />
                  </ActionIcon>
                  <ActionIcon variant="filled" size="lg" radius="xl" className="bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg hover:scale-105 transition-transform">
                    <IconPlus size={20} />
                  </ActionIcon>
                </Group>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                  {/* Upload Box with just icon */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Paper
                      radius="lg"
                      className="bg-white/80 backdrop-blur-lg border border-gray-100 shadow-lg hover:shadow-xl transition-all p-0 overflow-hidden"
                    >
                      <div className="flex flex-col items-center justify-center h-80 cursor-pointer" onClick={() => navigate('/upload')}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <ThemeIcon 
                            size={100} 
                            radius={100} 
                            className="bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg mb-6"
                          >
                            <IconUpload size={50} stroke={1.5} />
                          </ThemeIcon>
                        </motion.div>
                        <Text size="xl" fw={500} className="text-gray-600 mb-2">
                          Upload your PDF
                        </Text>
                        <Text c="dimmed" size="sm">
                          Click to browse or drag and drop
                        </Text>
                        <Text className="text-violet-500 mt-4 font-medium">
                          Max size: 30MB
                        </Text>
                      </div>
                    </Paper>
                  </motion.div>

                  {/* YouTube URL Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      fullWidth
                      size="xl"
                      variant="light"
                      radius="lg"
                      leftSection={<IconBrandYoutube size={24} className="text-red-500" />}
                      className="bg-white/80 backdrop-blur-md border border-gray-100 shadow-md hover:shadow-lg h-16 transition-all"
                      onClick={() => navigate('/youtube')}
                    >
                      <Text size="lg">Import from YouTube</Text>
                    </Button>
                  </motion.div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card decoration="top" decorationColor="indigo" className="bg-white/95 backdrop-blur-md shadow-lg">
                      <Title order={3} mb="md" className="text-gray-800">Quick Stats</Title>
                      <div className="space-y-4">
                        <div>
                          <Text className="text-gray-600 font-medium">PDF Documents</Text>
                          <Group grow wrap="nowrap" mt="xs" align="center">
                            <Metric className="text-violet-600 font-bold">3</Metric>
                            <ThemeIcon radius="xl" size="xl" className="bg-gradient-to-r from-violet-500 to-purple-500">
                              <IconFileText size={24} stroke={1.5} />
                            </ThemeIcon>
                          </Group>
                          <ProgressBar value={60} color="indigo" className="mt-2" />
                        </div>
                        <div>
                          <Text className="text-gray-600 font-medium">YouTube Videos</Text>
                          <Group grow wrap="nowrap" mt="xs" align="center">
                            <Metric className="text-pink-600 font-bold">2</Metric>
                            <ThemeIcon radius="xl" size="xl" className="bg-gradient-to-r from-pink-500 to-rose-500">
                              <IconBrandYoutube size={24} stroke={1.5} />
                            </ThemeIcon>
                          </Group>
                          <ProgressBar value={40} color="pink" className="mt-2" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="bg-white/95 backdrop-blur-md shadow-lg">
                      <Title order={3} mb="md" className="text-gray-800">Recent Activity</Title>
                      <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + (item * 0.1) }}
                            className="p-4 rounded-lg bg-gradient-to-r from-gray-50/80 to-white/80 hover:from-gray-100/80 hover:to-gray-50/80 transition-colors shadow-sm cursor-pointer"
                          >
                            <Group wrap="nowrap">
                              <ThemeIcon 
                                radius="xl" 
                                size="md" 
                                className={`bg-gradient-to-r ${item % 2 === 0 ? 'from-violet-500 to-purple-500' : 'from-pink-500 to-rose-500'}`}
                              >
                                <IconClock size={16} stroke={1.5} />
                              </ThemeIcon>
                              <div>
                                <Text size="sm" fw={500}>Document {item}</Text>
                                <Text size="xs" c="dimmed">2 hours ago</Text>
                              </div>
                            </Group>
                          </motion.div>
                        ))}
                      </div>
                      <Button 
                        variant="subtle" 
                        fullWidth 
                        mt="md" 
                        className="text-violet-600 hover:bg-violet-50"
                      >
                        View All Activity
                      </Button>
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </Container>
        </AppShell.Main>
      </AppShell>
    </div>
  );
}