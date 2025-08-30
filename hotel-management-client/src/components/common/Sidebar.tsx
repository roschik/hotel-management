import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Tooltip,
  Typography,
  Collapse,
} from '@mui/material';
import {
  FlashOn as QuickBookingIcon,
  Hotel as StaysIcon,
  PointOfSale as SalesIcon,
  Receipt as InvoicesIcon,
  BookOnline as BookingsIcon,
  MeetingRoom as RoomsIcon,
  People as GuestsIcon,
  Work as StaffIcon,
  RoomService as ServicesIcon,
  Analytics as AnalyticsIcon,
  ExpandLess,
  ExpandMore,
  Folder as FolderIcon,
} from '@mui/icons-material';

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const drawerWidth = 240;
const collapsedWidth = 60;

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [referencesOpen, setReferencesOpen] = useState(false);

  // Основные пункты меню
  const mainNavigationItems: NavigationItem[] = [
    {
      id: 'quick-booking',
      label: 'Бронирование',
      path: '/quick-booking',
      icon: <QuickBookingIcon />,
    },
    {
      id: 'stays',
      label: 'Проживание',
      path: '/stays',
      icon: <StaysIcon />,
    },
    {
      id: 'service-sales',
      label: 'Продажа услуг',
      path: '/service-sales',
      icon: <SalesIcon />,
    },
    {
      id: 'invoices',
      label: 'Счета',
      path: '/invoices',
      icon: <InvoicesIcon />,
    },
  ];

  // Справочники
  const referenceItems: NavigationItem[] = [
    {
      id: 'bookings',
      label: 'Бронирования',
      path: '/bookings',
      icon: <BookingsIcon />,
    },
    {
      id: 'rooms',
      label: 'Номера',
      path: '/rooms',
      icon: <RoomsIcon />,
    },
    {
      id: 'guests',
      label: 'Гости',
      path: '/guests',
      icon: <GuestsIcon />,
    },
    {
      id: 'staff',
      label: 'Персонал',
      path: '/staff',
      icon: <StaffIcon />,
    },
    {
      id: 'services',
      label: 'Услуги',
      path: '/services',
      icon: <ServicesIcon />,
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isReferenceActive = () => {
    return referenceItems.some(item => isActive(item.path));
  };

  const handleReferencesToggle = () => {
    setReferencesOpen(!referencesOpen);
  };

  const renderMenuItem = (item: NavigationItem, isNested = false) => {
    const active = isActive(item.path);
    
    return (
      <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
        <Tooltip
          title={open ? '' : item.label}
          placement="right"
          arrow
        >
          <ListItemButton
            onClick={() => handleNavigation(item.path)}
            sx={{
              minHeight: 48,
              pl: isNested ? 4 : 2,
              pr: 2,
              mx: 0,
              borderRadius: 0,
              backgroundColor: active ? 'primary.main' : 'transparent',
              color: active ? 'white' : 'text.primary',
              '&:hover': {
                backgroundColor: active
                  ? 'primary.dark'
                  : 'action.hover',
                borderRadius: 0,
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : 'auto',
                justifyContent: 'center',
                color: active ? 'white' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            {open && (
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                  },
                }}
              />
            )}
            
            {/* Бейдж для уведомлений */}
            {open && item.badge && (
              <Box
                sx={{
                  backgroundColor: 'error.main',
                  color: 'white',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {item.badge}
              </Box>
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
          backgroundColor: '#F8F9FA',
          borderRight: '1px solid #e0e0e0',
        },
      }}
    >

      {/* Основные пункты меню */}
      <List sx={{ px: 0, mt: 6.8 }}>
        {mainNavigationItems.map((item) => renderMenuItem(item))}
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* Справочники */}
      <List sx={{ px: 0 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <Tooltip
            title={open ? '' : 'Справочники'}
            placement="right"
            arrow
          >
            <ListItemButton
              onClick={handleReferencesToggle}
              sx={{
                minHeight: 48,
                pl: 2,
                pr: 2,
                mx: 0,
                borderRadius: 0,
                backgroundColor: isReferenceActive() ? 'primary.main' : 'transparent',
                color: isReferenceActive() ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: isReferenceActive()
                    ? 'primary.dark'
                    : 'action.hover',
                  borderRadius: 0,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isReferenceActive() ? 'white' : 'text.secondary',
                }}
              >
                <FolderIcon />
              </ListItemIcon>
              
              {open && (
                <>
                  <ListItemText
                    primary="Справочники"
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontSize: '0.875rem',
                        fontWeight: isReferenceActive() ? 600 : 400,
                      },
                    }}
                  />
                  {referencesOpen ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
        
        {/* Выпадающий список справочников */}
        <Collapse in={referencesOpen && open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ px: 0 }}>
            {referenceItems.map((item) => renderMenuItem(item, true))}
          </List>
        </Collapse>
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* Аналитика */}
      {open && (
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'text.secondary',
              letterSpacing: '0.5px',
            }}
          >
            Аналитика
          </Typography>
        </Box>
      )}

      <List sx={{ px: 0 }}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <Tooltip
            title={open ? '' : 'Отчеты'}
            placement="right"
            arrow
          >
            <ListItemButton
              onClick={() => handleNavigation('/analytics')}
              sx={{
                minHeight: 48,
                pl: 2,
                pr: 2,
                mx: 0,
                borderRadius: 0,
                backgroundColor: isActive('/analytics') ? 'primary.main' : 'transparent',
                color: isActive('/analytics') ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive('/analytics')
                    ? 'primary.dark'
                    : 'action.hover',
                  borderRadius: 0,
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: isActive('/analytics') ? 'white' : 'text.secondary',
                }}
              >
                <AnalyticsIcon />
              </ListItemIcon>
              
              {open && (
                <ListItemText
                  primary="Отчеты"
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: isActive('/analytics') ? 600 : 400,
                    },
                  }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;