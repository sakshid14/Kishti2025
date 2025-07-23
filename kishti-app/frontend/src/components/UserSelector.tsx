import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Person, Business } from '@mui/icons-material';
import { User } from '../types';
import { userApi } from '../services/api';

interface UserSelectorProps {
  onUserSelect: (user: User) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ onUserSelect }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load users from API, if fails, use demo data
      try {
        const response = await userApi.getAllUsers();
        setUsers(response.data);
      } catch (apiError) {
        // If API is not available, create demo users
        const demoUsers: User[] = [
          {
            id: 1,
            username: 'john_borrower',
            email: 'john@example.com',
            fullName: 'John Smith',
            phoneNumber: '+91-9876543210',
            userType: 'BORROWER',
            businessName: 'Smith Enterprises',
            businessAddress: 'Mumbai, Maharashtra',
            panNumber: 'ABCDE1234F',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            username: 'jane_lender',
            email: 'jane@example.com',
            fullName: 'Jane Doe',
            phoneNumber: '+91-9876543211',
            userType: 'LENDER',
            businessName: 'Doe Financial Services',
            businessAddress: 'Delhi, NCR',
            panNumber: 'FGHIJ5678K',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 3,
            username: 'ram_borrower',
            email: 'ram@example.com',
            fullName: 'Ram Kumar',
            phoneNumber: '+91-9876543212',
            userType: 'BORROWER',
            businessName: 'Kumar Textiles',
            businessAddress: 'Bangalore, Karnataka',
            panNumber: 'KLMNO9012P',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 4,
            username: 'priya_lender',
            email: 'priya@example.com',
            fullName: 'Priya Sharma',
            phoneNumber: '+91-9876543213',
            userType: 'LENDER',
            businessName: 'Sharma Capital',
            businessAddress: 'Pune, Maharashtra',
            panNumber: 'QRSTU3456V',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        setUsers(demoUsers);
        setError('Using demo data - Backend not connected');
      }
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const borrowers = users.filter(user => user.userType === 'BORROWER');
  const lenders = users.filter(user => user.userType === 'LENDER');

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Users...
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Welcome to Kishti EMI Wallet
        </Typography>
        
        <Typography variant="subtitle1" align="center" sx={{ mb: 4, color: 'text.secondary' }}>
          Select a user to continue (Demo Mode)
        </Typography>

        {error && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {/* Borrowers */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Person sx={{ mr: 1 }} />
              Borrowers
            </Typography>
            
            <List>
              {borrowers.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => onUserSelect(user)}
                >
                  <ListItemIcon>
                    <Business color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={user.fullName}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {user.businessName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.businessAddress}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip label="Borrower" color="primary" size="small" />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Lenders */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Business sx={{ mr: 1 }} />
              Lenders
            </Typography>
            
            <List>
              {lenders.map((user) => (
                <ListItem
                  key={user.id}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => onUserSelect(user)}
                >
                  <ListItemIcon>
                    <Business color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={user.fullName}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {user.businessName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.businessAddress}
                        </Typography>
                      </Box>
                    }
                  />
                  <Chip label="Lender" color="secondary" size="small" />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" align="center" color="text.secondary">
          Click on any user above to access their dashboard
        </Typography>
      </Paper>
    </Container>
  );
};

export default UserSelector;