import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Stack,
  Group,
  Divider,
  Center,
  Box,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconBrandGoogle } from '@tabler/icons-react';
import { Card, Metric, ProgressBar } from '@tremor/react';
import { motion } from 'framer-motion';

interface FormValues {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export function AuthPage() {
  const [type, setType] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    initialValues: {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    },
    validate: {
      email: (val: string) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val: string) => (val.length < 6 ? 'Password should be at least 6 characters' : null),
      confirmPassword: (val: string, values: FormValues) =>
        type === 'register' && val !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const endpoint = type === 'login' ? '/login' : '/register';
      // Your existing authentication logic here
      notifications.show({
        title: 'Success',
        message: type === 'login' ? 'Logged in successfully' : 'Account created successfully',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'An error occurred',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Container size={420} my={40}>
        <Title ta="center" className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to Intuit Notes
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {type === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <Button
            // variant="subtle"
            size="xs"
            onClick={() => setType(type === 'login' ? 'register' : 'login')}
          >
            {type === 'login' ? 'Create account' : 'Login'}
          </Button>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              {type === 'register' && (
                <TextInput
                  label="Name"
                  placeholder="Your name"
                  required
                  {...form.getInputProps('name')}
                />
              )}

              <TextInput
                label="Email"
                placeholder="you@example.com"
                required
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
              />

              {type === 'register' && (
                <PasswordInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  required
                  {...form.getInputProps('confirmPassword')}
                />
              )}
            </Stack>

            <Button
              fullWidth
              mt="xl"
              loading={loading}
              className="bg-gradient-to-r from-violet-600 to-purple-600"
            >
              {type === 'login' ? 'Sign in' : 'Create account'}
            </Button>

            <Divider label="Or continue with" labelPosition="center" my="lg" />

            <Group grow mb="md" mt="md">
              <Button
                leftSection={<IconBrandGoogle size={20} />}
                // variant="default"
                className="hover:bg-gray-100"
              >
                Google
              </Button>
            </Group>
          </form>
        </Paper>
      </Container>
    </motion.div>
  );
} 