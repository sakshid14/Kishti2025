import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  LinearProgress,
  Alert,
  Divider,
  Button,
} from '@mui/material';
import {
  AccountBalance,
  Payment,
  Schedule,
  TrendingUp,
  Wallet,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BorrowerDashboard as BorrowerDashboardType, Loan } from '../types';
import { emiWalletApi } from '../services/api';

interface BorrowerDashboardProps {
  userId: number;
}

const BorrowerDashboard: React.FC<BorrowerDashboardProps> = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState<BorrowerDashboardType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from API, if fails use demo data
      try {
        const response = await emiWalletApi.getBorrowerDashboard(userId);
        setDashboardData(response.data);
      } catch (apiError) {
        // Demo data for borrower dashboard
        const demoData: BorrowerDashboardType = {
          totalOutstandingAmount: 850000,
          totalMonthlyEMI: 85000,
          totalCollectedThisMonth: 62000,
          remainingEMIForThisMonth: 23000,
          activeLoanCount: 3,
          loanSummaries: [
            {
              loanId: 1,
              lenderName: 'Jane Doe',
              principalAmount: 500000,
              emiAmount: 50000,
              collectedAmount: 35000,
              remainingForThisMonth: 15000,
              status: 'ACTIVE',
              nextEMIDate: '2024-01-15',
            },
            {
              loanId: 2,
              lenderName: 'Priya Sharma',
              principalAmount: 250000,
              emiAmount: 25000,
              collectedAmount: 20000,
              remainingForThisMonth: 5000,
              status: 'ACTIVE',
              nextEMIDate: '2024-01-20',
            },
            {
              loanId: 3,
              lenderName: 'Capital Plus',
              principalAmount: 100000,
              emiAmount: 10000,
              collectedAmount: 7000,
              remainingForThisMonth: 3000,
              status: 'ACTIVE',
              nextEMIDate: '2024-01-25',
            },
          ],
          recentTransactions: [
            {
              id: 1,
              date: '2024-01-08',
              amount: 50000,
              emiCollected: 2500,
              description: 'Customer payment received',
              loanId: 1,
            },
            {
              id: 2,
              date: '2024-01-07',
              amount: 30000,
              emiCollected: 1500,
              description: 'Invoice settlement',
              loanId: 2,
            },
            {
              id: 3,
              date: '2024-01-06',
              amount: 25000,
              emiCollected: 1250,
              description: 'Service payment',
              loanId: 3,
            },
          ],
        };
        setDashboardData(demoData);
        setError('Using demo data - Backend not connected');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Alert severity="error">
        Failed to load dashboard data
      </Alert>
    );
  }

  const collectionProgress = (dashboardData.totalCollectedThisMonth / dashboardData.totalMonthlyEMI) * 100;

  const pieData = [
    { name: 'Collected', value: dashboardData.totalCollectedThisMonth, color: '#4caf50' },
    { name: 'Remaining', value: dashboardData.remainingEMIForThisMonth, color: '#ff9800' },
  ];

  const chartData = dashboardData.loanSummaries.map(loan => ({
    name: loan.lenderName,
    collected: loan.collectedAmount,
    remaining: loan.remainingForThisMonth,
    total: loan.emiAmount,
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Borrower Dashboard
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1 }} />
                <Typography variant="h6">Total Outstanding</Typography>
              </Box>
              <Typography variant="h4">
                ₹{dashboardData.totalOutstandingAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment sx={{ mr: 1 }} />
                <Typography variant="h6">Monthly EMI</Typography>
              </Box>
              <Typography variant="h4">
                ₹{dashboardData.totalMonthlyEMI.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Wallet sx={{ mr: 1 }} />
                <Typography variant="h6">Collected</Typography>
              </Box>
              <Typography variant="h4">
                ₹{dashboardData.totalCollectedThisMonth.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} />
                <Typography variant="h6">Active Loans</Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.activeLoanCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* EMI Collection Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              This Month's EMI Collection Progress
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  ₹{dashboardData.totalCollectedThisMonth.toLocaleString()} collected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {collectionProgress.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={collectionProgress} 
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                ₹{dashboardData.remainingEMIForThisMonth.toLocaleString()} remaining
              </Typography>
            </Box>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Loan-wise Collection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Loan-wise Collection Status
            </Typography>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="collected" fill="#4caf50" name="Collected" />
                <Bar dataKey="remaining" fill="#ff9800" name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Loan Summaries */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Loans Summary
            </Typography>
            
            <List>
              {dashboardData.loanSummaries.map((loan, index) => (
                <React.Fragment key={loan.loanId}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {loan.lenderName}
                          </Typography>
                          <Chip 
                            label={loan.status} 
                            color="primary" 
                            size="small" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Principal: ₹{loan.principalAmount.toLocaleString()} | 
                            EMI: ₹{loan.emiAmount.toLocaleString()}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                            <Typography variant="body2">
                              Collected: ₹{loan.collectedAmount.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="warning.main">
                              Remaining: ₹{loan.remainingForThisMonth.toLocaleString()}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(loan.collectedAmount / loan.emiAmount) * 100}
                            sx={{ mt: 1 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Next EMI: {new Date(loan.nextEMIDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.loanSummaries.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            
            <List>
              {dashboardData.recentTransactions.map((transaction, index) => (
                <React.Fragment key={transaction.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={transaction.description}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Amount: ₹{transaction.amount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            EMI Collected: ₹{transaction.emiCollected.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transaction.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.recentTransactions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BorrowerDashboard;