import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
} from '@mui/material';
import QuickActions from './QuickActions';

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ 
      flexGrow: 1, 
      p: 3,
      background: 'transparent',
      minHeight: '100vh',
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{
          mb: 4,
          color: '#2C3E50',
          fontWeight: 700,
          fontSize: '2.5rem',
        }}
      >
        🏨 Панель управления гостиницей
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 8 }}>


          <Card sx={{ 
            mb: 3,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid rgba(179, 157, 219, 0.15)',
          }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#4A148C' }} fontWeight={600}>
                ⚡ Быстрые действия
              </Typography>
              <QuickActions />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;