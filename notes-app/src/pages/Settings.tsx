//@ts-nocheck
import { useState } from 'react';
import { AppShell, Container, Title, Text, Paper, Switch, Divider, Group, Button, ThemeIcon, Select } from '@mantine/core';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { 
  IconPalette, 
  IconBell, 
  IconShield, 
  IconDeviceDesktop, 
  IconUserCircle,
  IconCheck
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

export function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleSaveSettings = () => {
    notifications.show({
      title: "Success",
      message: "Your settings have been saved",
      color: "green",
      icon: <IconCheck size={16} />,
    });
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
                  Settings
                </Title>
                <Text c="dimmed" size="lg" className="max-w-lg mx-auto">
                  Customize your Intuit Notes experience
                </Text>
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
                  {/* Appearance */}
                  <div className="mb-8">
                    <Group position="apart" mb="md">
                      <Group>
                        <ThemeIcon 
                          size="lg" 
                          radius="md" 
                          variant="light" 
                          color="violet"
                        >
                          <IconPalette size={20} />
                        </ThemeIcon>
                        <Title order={3}>Appearance</Title>
                      </Group>
                    </Group>
                    <div className="pl-10">
                      <Group position="apart" mb="xs">
                        <Text>Dark Mode</Text>
                        <Switch 
                          checked={darkMode} 
                          onChange={(event) => setDarkMode(event.currentTarget.checked)} 
                          color="violet"
                        />
                      </Group>
                      <Group position="apart">
                        <Text>Language</Text>
                        <Select
                          value={language}
                          onChange={setLanguage}
                          data={[
                            { value: 'en', label: 'English' },
                            { value: 'es', label: 'Spanish' },
                            { value: 'fr', label: 'French' },
                            { value: 'de', label: 'German' },
                          ]}
                          style={{ width: 130 }}
                        />
                      </Group>
                    </div>
                  </div>
                  
                  <Divider my="lg" />
                  
                  {/* Notifications */}
                  <div className="mb-8">
                    <Group position="apart" mb="md">
                      <Group>
                        <ThemeIcon 
                          size="lg" 
                          radius="md" 
                          variant="light" 
                          color="pink"
                        >
                          <IconBell size={20} />
                        </ThemeIcon>
                        <Title order={3}>Notifications</Title>
                      </Group>
                    </Group>
                    <div className="pl-10">
                      <Group position="apart">
                        <Text>Email Notifications</Text>
                        <Switch 
                          checked={emailNotifications} 
                          onChange={(event) => setEmailNotifications(event.currentTarget.checked)} 
                          color="pink"
                        />
                      </Group>
                    </div>
                  </div>
                  
                  <Divider my="lg" />
                  
                  {/* Security */}
                  <div className="mb-8">
                    <Group position="apart" mb="md">
                      <Group>
                        <ThemeIcon 
                          size="lg" 
                          radius="md" 
                          variant="light" 
                          color="blue"
                        >
                          <IconShield size={20} />
                        </ThemeIcon>
                        <Title order={3}>Security</Title>
                      </Group>
                    </Group>
                    <div className="pl-10">
                      <Group position="apart">
                        <Text>Two-Factor Authentication</Text>
                        <Switch 
                          checked={twoFactorAuth} 
                          onChange={(event) => setTwoFactorAuth(event.currentTarget.checked)} 
                          color="blue"
                        />
                      </Group>
                    </div>
                  </div>
                  
                  <Divider my="lg" />
                  
                  {/* Account */}
                  <div className="mb-8">
                    <Group position="apart" mb="md">
                      <Group>
                        <ThemeIcon 
                          size="lg" 
                          radius="md" 
                          variant="light" 
                          color="green"
                        >
                          <IconUserCircle size={20} />
                        </ThemeIcon>
                        <Title order={3}>Account</Title>
                      </Group>
                    </Group>
                    <div className="pl-10 space-y-4">
                      <Text>Email: user@example.com</Text>
                      <Group>
                        <Button variant="outline" color="red">Delete Account</Button>
                        <Button variant="outline" color="gray">Change Password</Button>
                      </Group>
                    </div>
                  </div>
                  
                  <Divider my="lg" />
                  
                  <Group position="right" mt="xl">
                    <Button variant="default">Cancel</Button>
                    <Button 
                      className="bg-gradient-to-r from-violet-600 to-purple-600"
                      onClick={handleSaveSettings}
                    >
                      Save Changes
                    </Button>
                  </Group>
                </Paper>
              </motion.div>
            </motion.div>
          </Container>
        </AppShell.Main>
      </AppShell>
    </div>
  );
} 