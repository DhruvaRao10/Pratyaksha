//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AppShell, 
  Text,
  ThemeIcon,
  Divider,
  Tooltip,
  ActionIcon,
  Box,
  rem,
  useMantineTheme
} from '@mantine/core';
import { createStyles } from '@mantine/emotion';
import '../styles/navigation.css';

import { 
  IconHome, 
  IconUpload, 
  IconBrandYoutube, 
  IconSettings, 
  IconLogout,
  IconNotebook,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconHistory
} from '@tabler/icons-react';

// Define types for better type safety
interface NavItem {
  link: string;
  label: string;
  icon: React.ComponentType<{ size?: number, stroke?: number }>;
}

// Extract navigation items to a constant outside the component
const NAV_ITEMS: NavItem[] = [
  { link: '/', label: 'Home', icon: IconHome },
  { link: '/upload', label: 'Upload PDF', icon: IconUpload },
  { link: '/youtube', label: 'YouTube Import', icon: IconBrandYoutube },
  { link: '/history', label: 'Analysis History', icon: IconHistory },
  { link: '/settings', label: 'Settings', icon: IconSettings },
];

// Separate styles creation
const useStyles = createStyles((theme) => ({
  navbar: {
    borderRight: 'none',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,255,0.9))',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 0 15px rgba(0,0,0,0.05)',
    zIndex: 100,
  },
  header: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  logo: {
    backgroundImage: 'linear-gradient(45deg, var(--mantine-color-violet-6), var(--mantine-color-pink-6))',
    color: 'white',
  },
  links: {
    marginLeft: -theme.spacing.md,
    marginRight: -theme.spacing.md,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
  linksInner: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[7],
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,
    fontWeight: 500,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.colors.violet[0] + 'B2', // Hex with 0.7 opacity
      color: theme.colors.violet[7],
      transform: 'translateX(3px)',
    },
  },
  linkActive: {
    backgroundColor: theme.colors.violet[0] + 'B2', // Hex with 0.7 opacity
    color: theme.colors.violet[7],
    '& .nav-icon': {
      color: 'white',
      backgroundImage: 'linear-gradient(45deg, var(--mantine-color-violet-6), var(--mantine-color-pink-6))',
    },
  },
  linkIcon: {
    color: theme.colors.gray[6],
    marginRight: theme.spacing.sm,
    width: rem(32),
    height: rem(32),
    borderRadius: rem(8),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  footer: {
    borderTop: `${rem(1)} solid ${theme.colors.gray[2]}`,
    padding: theme.spacing.md,
  },
  footerLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.red[6],
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,
    fontWeight: 500,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.colors.violet[0] + 'B2', // Hex with 0.7 opacity
    },
  },
  navbarCollapse: {
    position: 'absolute',
    top: '50%',
    right: -18,
    transform: 'translateY(-50%)',
    zIndex: 999,
  },
  collapsedLink: {
    justifyContent: 'center',
    padding: theme.spacing.xs,
    '& .nav-icon': {
      marginRight: 0,
    },
  },
  collapsedBrand: {
    justifyContent: 'center',
    padding: theme.spacing.xs,
  },
  mobileToggle: {
    position: 'fixed',
    top: theme.spacing.md,
    left: theme.spacing.md,
    zIndex: 1000,
    backgroundColor: theme.white,
    boxShadow: theme.shadows.sm,
  },
}));

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useMantineTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpened, setMobileOpened] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { classes, cx } = useStyles();

  // Check if the screen is mobile on mount and when it resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Apply content margin classes based on collapsed state
  useEffect(() => {
    // Update AppShell Main classes
    const appShellMains = document.querySelectorAll('.mantine-AppShell-main');
    appShellMains.forEach(main => {
      if (collapsed) {
        main.classList.remove('content-with-sidebar');
        main.classList.add('content-with-sidebar-collapsed');
      } else {
        main.classList.add('content-with-sidebar');
        main.classList.remove('content-with-sidebar-collapsed');
      }
    });
  }, [collapsed]);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobile = () => {
    setMobileOpened(!mobileOpened);
  };

  // Create a reusable NavLink component
  const NavLink: React.FC<NavItem> = ({ link, label, icon: Icon }) => {
    const isActive = location.pathname === link;
    
    return (
      <Tooltip 
        label={label} 
        position="right" 
        disabled={!collapsed}
        withArrow
        withinPortal
      >
        <a
          href="#/"
          className={cx(
            classes.link, 
            'nav-link-transition',
            { 
              [classes.linkActive]: isActive,
              [classes.collapsedLink]: collapsed,
              'nav-item-active': isActive
            }
          )}
          onClick={(e) => {
            e.preventDefault();
            navigate(link);
            if (mobileOpened) {
              setMobileOpened(false);
            }
          }}
        >
          <ThemeIcon 
            size={32} 
            radius="md" 
            variant="light" 
            className={cx("nav-icon", classes.linkIcon, {
              'nav-item-active-icon': isActive
            })}
          >
            <Icon size={18} stroke={1.5} />
          </ThemeIcon>
          {!collapsed && <span>{label}</span>}
        </a>
      </Tooltip>
    );
  };

  // Handle logout in a separate function
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  // For mobile view
  if (isMobile) {
    return (
      <>
        <ActionIcon
          className={cx(classes.mobileToggle, 'navbar-toggle-btn')}
          variant="filled"
          size="lg"
          radius="md"
          color="violet"
          onClick={toggleMobile}
        >
          <IconMenu2 size={20} />
        </ActionIcon>

        <AppShell.Navbar
          width={{ sm: 260 }}
          p="md"
          hidden={!mobileOpened}
          hiddenBreakpoint="sm"
          className={cx(
            classes.navbar, 
            "transition-all duration-300 ease-in-out fixed-navbar",
            { 'mobile-nav-open': mobileOpened }
          )}
        >
          <AppShell.Section className={classes.brand}>
            <ThemeIcon size={40} radius="md" className={classes.logo}>
              <IconNotebook size={22} />
            </ThemeIcon>
            <Text fw={700} size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Intuit Notes
            </Text>
          </AppShell.Section>

          <Divider />
          
          <AppShell.Section grow className={classes.links}>
            <div className={classes.linksInner}>
              {NAV_ITEMS.map((item) => (
                <NavLink 
                  key={item.label} 
                  {...item} 
                />
              ))}
            </div>
          </AppShell.Section>

          <Divider />

          <AppShell.Section className={classes.footer}>
            <a 
              href="#/"
              className={classes.footerLink} 
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <ThemeIcon size={32} radius="md" variant="light" color="red" className={classes.linkIcon}>
                <IconLogout size={18} stroke={1.5} />
              </ThemeIcon>
              <span>Logout</span>
            </a>
          </AppShell.Section>
        </AppShell.Navbar>
      </>
    );
  }

  return (
    <AppShell.Navbar
      width={{ base: collapsed ? 80 : 260 }}
      p={collapsed ? "xs" : "md"}
      className={cx(
        classes.navbar, 
        "nav-transition fixed-navbar",
        { 'navbar-collapsed': collapsed }
      )}
    >
      <AppShell.Section className={cx(classes.brand, { [classes.collapsedBrand]: collapsed })}>
        <ThemeIcon size={40} radius="md" className={classes.logo}>
          <IconNotebook size={22} />
        </ThemeIcon>
        {!collapsed && (
          <Text fw={700} size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent collapse-transition">
            Intuit Notes
          </Text>
        )}
      </AppShell.Section>

      <Box className={classes.navbarCollapse}>
        <ActionIcon
          variant="filled"
          size="lg"
          radius="xl"
          color="violet"
          className="shadow-lg navbar-toggle-btn"
          onClick={toggleCollapsed}
        >
          {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
        </ActionIcon>
      </Box>

      <Divider mb="md" />
      
      <AppShell.Section grow className={classes.links}>
        <div className={cx(classes.linksInner, { "items-center": collapsed })}>
          {NAV_ITEMS.map((item) => (
            <NavLink 
              key={item.label} 
              {...item} 
            />
          ))}
        </div>
      </AppShell.Section>

      <Divider mt="md" />

      <AppShell.Section className={classes.footer}>
        <Tooltip 
          label="Logout" 
          position="right" 
          disabled={!collapsed}
          withArrow
          withinPortal
        >
          <a 
            href="#/"
            className={cx(classes.footerLink, { [classes.collapsedLink]: collapsed })} 
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
          >
            <ThemeIcon size={32} radius="md" variant="light" color="red" className={classes.linkIcon}>
              <IconLogout size={18} stroke={1.5} />
            </ThemeIcon>
            {!collapsed && <span className="collapse-transition">Logout</span>}
          </a>
        </Tooltip>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}