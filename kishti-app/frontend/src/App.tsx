import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { User } from './types';
import Navbar from './components/Navbar';
import BorrowerDashboard from './components/BorrowerDashboard';
import LenderDashboard from './components/LenderDashboard';
import UserSelector from './components/UserSelector';
import LoanManagement from './components/LoanManagement';
import TransactionForm from './components/TransactionForm';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // For demo purposes, we'll simulate user selection
  // In a real app, this would come from authentication
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <UserSelector onUserSelect={handleUserSelect} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar user={currentUser} onLogout={handleLogout} />
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Routes>
              <Route
                path="/"
                element={
                  currentUser.userType === 'BORROWER' ? (
                    <BorrowerDashboard userId={currentUser.id} />
                  ) : (
                    <LenderDashboard userId={currentUser.id} />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  currentUser.userType === 'BORROWER' ? (
                    <BorrowerDashboard userId={currentUser.id} />
                  ) : (
                    <LenderDashboard userId={currentUser.id} />
                  )
                }
              />
              <Route
                path="/loans"
                element={<LoanManagement currentUser={currentUser} />}
              />
              <Route
                path="/transactions"
                element={<TransactionForm currentUser={currentUser} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
