import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as PersonAddIcon,
  RoomService as ServiceIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      title: 'Новое бронирование',
      description: 'Создать бронирование',
      icon: <AddIcon />,
      color: '#1976d2',
      path: '/quick-booking',
    },
    {
      title: 'Регистрация гостя',
      description: 'Добавить нового гостя',
      icon: <PersonAddIcon />,
      color: '#388e3c',
      path: '/guests',
    },
    {
      title: 'Заказ услуг',
      description: 'Оформить дополнительные услуги',
      icon: <ServiceIcon />,
      color: '#f57c00',
      path: '/service-sales',
    },
    {
      title: 'Отчеты',
      description: 'Просмотр аналитики',
      icon: <ReportIcon />,
      color: '#7b1fa2',
      path: '/analytics',
    },
  ];

  const handleActionClick = (path: string) => {
    navigate(path);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Быстрые действия
        </Typography>
        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid size={{ xs: 12, sm: 6 }} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={() => handleActionClick(action.path)}
                sx={{
                  p: 2,
                  height: '80px',
                  flexDirection: 'column',
                  borderColor: action.color,
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    backgroundColor: `${action.color}10`,
                  },
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default QuickActions;