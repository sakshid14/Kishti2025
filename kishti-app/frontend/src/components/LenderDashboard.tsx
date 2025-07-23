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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AccountBalance,
  Schedule,
  Payment,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { LenderDashboard as LenderDashboardType } from '../types';
import { emiWalletApi } from '../services/api';

interface LenderDashboardProps {
  userId: number;
}

const LenderDashboard: React.FC<LenderDashboardProps> = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState<LenderDashboardType | null>(null);
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
        const response = await emiWalletApi.getLenderDashboard(userId);
        setDashboardData(response.data);
      } catch (apiError) {
        // Demo data for lender dashboard
        const demoData: LenderDashboardType = {
          totalLoanAmount: 1500000,
          totalOutstandingAmount: 1200000,
          totalMonthlyEMIExpected: 150000,
          totalCollectedThisMonth: 112000,
          activeBorrowerCount: 5,
          borrowerSummaries: [
            {
              borrowerId: 1,
              borrowerName: 'John Smith',
              totalLoanAmount: 500000,
              totalOutstanding: 400000,
              monthlyEMI: 50000,
              walletBalance: 35000,
              status: 'ACTIVE',
              lastPaymentDate: '2024-01-05',
            },
            {
              borrowerId: 3,
              borrowerName: 'Ram Kumar',
              totalLoanAmount: 250000,
              totalOutstanding: 200000,
              monthlyEMI: 25000,
              walletBalance: 18000,
              status: 'ACTIVE',
              lastPaymentDate: '2024-01-03',
            },
            {
              borrowerId: 5,
              borrowerName: 'Anita Patel',
              totalLoanAmount: 300000,
              totalOutstanding: 250000,
              monthlyEMI: 30000,
              walletBalance: 22000,
              status: 'ACTIVE',
              lastPaymentDate: '2024-01-06',
            },
            {
              borrowerId: 7,
              borrowerName: 'Suresh Reddy',
              totalLoanAmount: 200000,
              totalOutstanding: 150000,
              monthlyEMI: 20000,
              walletBalance: 15000,
              status: 'ACTIVE',
              lastPaymentDate: '2024-01-04',
            },
            {
              borrowerId: 9,
              borrowerName: 'Meera Singh',
              totalLoanAmount: 250000,
              totalOutstanding: 200000,
              monthlyEMI: 25000,
              walletBalance: 22000,
              status: 'OVERDUE',
            },
          ],
          upcomingPayments: [
            {
              paymentId: 1,
              loanId: 1,
              borrowerName: 'John Smith',
              amount: 50000,
              dueDate: '2024-01-15',
              status: 'PENDING',
            },
            {
              paymentId: 2,
              loanId: 2,
              borrowerName: 'Ram Kumar',
              amount: 25000,
              dueDate: '2024-01-18',
              status: 'PENDING',
            },
            {
              paymentId: 3,
              loanId: 3,
              borrowerName: 'Anita Patel',
              amount: 30000,
              dueDate: '2024-01-20',
              status: 'PENDING',
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

  const collectionRate = (dashboardData.totalCollectedThisMonth / dashboardData.totalMonthlyEMIExpected) * 100;
  
  const borrowerChartData = dashboardData.borrowerSummaries.map(borrower => ({
    name: borrower.borrowerName.split(' ')[0], // First name only for space
    expected: borrower.monthlyEMI,
    collected: borrower.walletBalance,
    outstanding: borrower.totalOutstanding,
  }));

  const monthlyTrends = [
    { month: 'Oct', collected: 95000, expected: 140000 },
    { month: 'Nov', collected: 105000, expected: 145000 },
    { month: 'Dec', collected: 108000, expected: 148000 },
    { month: 'Jan', collected: 112000, expected: 150000 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Lender Dashboard
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
                <Typography variant="h6">Total Loans</Typography>
              </Box>
              <Typography variant="h4">
                ₹{dashboardData.totalLoanAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} />
                <Typography variant="h6">Outstanding</Typography>
              </Box>
              <Typography variant="h4">
                ₹{dashboardData.totalOutstandingAmount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment sx={{ mr: 1 }} />
                <Typography variant="h6">Monthly Collection</Typography>
              </Box>
              <Typography variant="h4">
                ₹{dashboardData.totalCollectedThisMonth.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {collectionRate.toFixed(1)}% of expected
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <People sx={{ mr: 1 }} />
                <Typography variant="h6">Active Borrowers</Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.activeBorrowerCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Collection Trends */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Collection Trends
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Line 
                  type="monotone" 
                  dataKey="expected" 
                  stroke="#ff9800" 
                  strokeWidth={2}
                  name="Expected"
                />
                <Line 
                  type="monotone" 
                  dataKey="collected" 
                  stroke="#4caf50" 
                  strokeWidth={2}
                  name="Collected"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Collection Progress */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              This Month's Progress
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h3" color="primary">
                {collectionRate.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collection Rate
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={collectionRate}
              sx={{ height: 12, borderRadius: 6, mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2">
                Collected: ₹{dashboardData.totalCollectedThisMonth.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">
                Expected: ₹{dashboardData.totalMonthlyEMIExpected.toLocaleString()}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Borrower-wise Collections */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Borrower-wise Collection Status
            </Typography>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={borrowerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                <Bar dataKey="expected" fill="#ff9800" name="Expected EMI" />
                <Bar dataKey="collected" fill="#4caf50" name="Wallet Balance" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Upcoming Payments */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming EMI Payments
            </Typography>
            
            <List>
              {dashboardData.upcomingPayments.map((payment, index) => (
                <React.Fragment key={payment.paymentId}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2">
                            {payment.borrowerName}
                          </Typography>
                          <Chip 
                            label={payment.status} 
                            color="warning" 
                            size="small" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Amount: ₹{payment.amount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < dashboardData.upcomingPayments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Borrower Portfolio */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Borrower Portfolio
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Borrower</TableCell>
                    <TableCell align="right">Loan Amount</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                    <TableCell align="right">Monthly EMI</TableCell>
                    <TableCell align="right">Wallet Balance</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Last Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.borrowerSummaries.map((borrower) => (
                    <TableRow key={borrower.borrowerId}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                            {borrower.borrowerName.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {borrower.borrowerName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ₹{borrower.totalLoanAmount.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ₹{borrower.totalOutstanding.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ₹{borrower.monthlyEMI.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2">
                            ₹{borrower.walletBalance.toLocaleString()}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={(borrower.walletBalance / borrower.monthlyEMI) * 100}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={borrower.status}
                          color={borrower.status === 'ACTIVE' ? 'success' : 'error'}
                          size="small"
                          icon={borrower.status === 'ACTIVE' ? <CheckCircle /> : <Warning />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {borrower.lastPaymentDate 
                            ? new Date(borrower.lastPaymentDate).toLocaleDateString()
                            : 'No payment'
                          }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LenderDashboard;