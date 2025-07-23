import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import {
  Add,
  Visibility,
  Edit,
  AccountBalance,
} from '@mui/icons-material';
import { User, Loan, LoanRequest } from '../types';
import { emiWalletApi, userApi } from '../services/api';

interface LoanManagementProps {
  currentUser: User;
}

const LoanManagement: React.FC<LoanManagementProps> = ({ currentUser }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newLoan, setNewLoan] = useState<LoanRequest>({
    borrowerId: 0,
    lenderId: 0,
    principalAmount: 0,
    interestRate: 0,
    loanTermMonths: 0,
    emiCollectionPercentage: 5,
    emiDueDate: 15,
  });

  useEffect(() => {
    loadData();
  }, [currentUser.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from API, if fails use demo data
      try {
        const [loansResponse, usersResponse] = await Promise.all([
          currentUser.userType === 'BORROWER' 
            ? emiWalletApi.getLoansByBorrower(currentUser.id)
            : emiWalletApi.getLoansByLender(currentUser.id),
          userApi.getAllUsers()
        ]);
        
        setLoans(loansResponse.data);
        setUsers(usersResponse.data);
      } catch (apiError) {
        // Demo data
        const demoLoans: Loan[] = [
          {
            id: 1,
            borrowerId: 1,
            lenderId: 2,
            principalAmount: 500000,
            interestRate: 12,
            loanTermMonths: 24,
            emiAmount: 23538,
            emiCollectionPercentage: 5,
            emiDueDate: 15,
            startDate: '2023-12-01',
            endDate: '2025-12-01',
            status: 'ACTIVE',
            borrowerName: 'John Smith',
            lenderName: 'Jane Doe',
            collectedAmount: 15000,
            remainingAmount: 8538,
          },
          {
            id: 2,
            borrowerId: 3,
            lenderId: 2,
            principalAmount: 250000,
            interestRate: 10,
            loanTermMonths: 18,
            emiAmount: 15234,
            emiCollectionPercentage: 4,
            emiDueDate: 20,
            startDate: '2024-01-01',
            endDate: '2025-07-01',
            status: 'ACTIVE',
            borrowerName: 'Ram Kumar',
            lenderName: 'Jane Doe',
            collectedAmount: 8000,
            remainingAmount: 7234,
          },
        ];

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
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
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
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
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
            createdAt: '2023-01-01',
            updatedAt: '2023-01-01',
          },
        ];

        // Filter loans based on user type
        const filteredLoans = currentUser.userType === 'BORROWER' 
          ? demoLoans.filter(loan => loan.borrowerId === currentUser.id)
          : demoLoans.filter(loan => loan.lenderId === currentUser.id);
        
        setLoans(filteredLoans);
        setUsers(demoUsers);
        setError('Using demo data - Backend not connected');
      }
    } catch (err) {
      setError('Failed to load loan data');
    } finally {
      setLoading(false);
    }
  };

  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 100 / 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi);
  };

  const handleCreateLoan = async () => {
    try {
      const emiAmount = calculateEMI(
        newLoan.principalAmount,
        newLoan.interestRate,
        newLoan.loanTermMonths
      );

      const loanData = {
        ...newLoan,
        emiAmount,
      };

      await emiWalletApi.createLoan(loanData);
      setDialogOpen(false);
      loadData();
      
      // Reset form
      setNewLoan({
        borrowerId: 0,
        lenderId: 0,
        principalAmount: 0,
        interestRate: 0,
        loanTermMonths: 0,
        emiCollectionPercentage: 5,
        emiDueDate: 15,
      });
    } catch (error) {
      console.error('Error creating loan:', error);
      setError('Failed to create loan');
    }
  };

  const getAvailableUsers = () => {
    if (currentUser.userType === 'BORROWER') {
      return users.filter(user => user.userType === 'LENDER');
    } else {
      return users.filter(user => user.userType === 'BORROWER');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'COMPLETED': return 'primary';
      case 'DEFAULTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Loan Management
        </Typography>
        
        {currentUser.userType === 'LENDER' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Create New Loan
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentUser.userType === 'BORROWER' ? 'My Loans' : 'Loans Given'}
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Loan ID</TableCell>
                <TableCell>
                  {currentUser.userType === 'BORROWER' ? 'Lender' : 'Borrower'}
                </TableCell>
                <TableCell align="right">Principal Amount</TableCell>
                <TableCell align="right">Interest Rate</TableCell>
                <TableCell align="right">EMI Amount</TableCell>
                <TableCell align="center">Term (Months)</TableCell>
                <TableCell align="center">EMI Collection %</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>#{loan.id}</TableCell>
                  <TableCell>
                    {currentUser.userType === 'BORROWER' ? loan.lenderName : loan.borrowerName}
                  </TableCell>
                  <TableCell align="right">
                    ₹{loan.principalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell align="right">{loan.interestRate}%</TableCell>
                  <TableCell align="right">
                    ₹{loan.emiAmount.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">{loan.loanTermMonths}</TableCell>
                  <TableCell align="center">{loan.emiCollectionPercentage}%</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={loan.status}
                      color={getStatusColor(loan.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No loans found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Loan Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Loan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={getAvailableUsers()}
                getOptionLabel={(option) => option.fullName}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2">{option.fullName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.businessName}
                      </Typography>
                    </Box>
                  </Box>
                )}
                onChange={(_, value) => {
                  if (value) {
                    setNewLoan(prev => ({
                      ...prev,
                      borrowerId: value.id,
                      lenderId: currentUser.id,
                    }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Borrower"
                    required
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Principal Amount"
                type="number"
                fullWidth
                required
                value={newLoan.principalAmount || ''}
                onChange={(e) => setNewLoan(prev => ({
                  ...prev,
                  principalAmount: Number(e.target.value)
                }))}
                InputProps={{
                  startAdornment: '₹',
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Interest Rate (%)"
                type="number"
                fullWidth
                required
                value={newLoan.interestRate || ''}
                onChange={(e) => setNewLoan(prev => ({
                  ...prev,
                  interestRate: Number(e.target.value)
                }))}
                InputProps={{
                  endAdornment: '%',
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Loan Term (Months)"
                type="number"
                fullWidth
                required
                value={newLoan.loanTermMonths || ''}
                onChange={(e) => setNewLoan(prev => ({
                  ...prev,
                  loanTermMonths: Number(e.target.value)
                }))}
              />
            </Grid>

            <Box sx={{ flex: 1 }}>
              <TextField
                label="EMI Collection Percentage"
                type="number"
                fullWidth
                required
                value={newLoan.emiCollectionPercentage}
                onChange={(e) => setNewLoan(prev => ({
                  ...prev,
                  emiCollectionPercentage: Number(e.target.value)
                }))}
                InputProps={{
                  endAdornment: '%',
                }}
                helperText="Percentage of each transaction to collect for EMI"
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <TextField
                label="EMI Due Date"
                type="number"
                fullWidth
                required
                value={newLoan.emiDueDate}
                onChange={(e) => setNewLoan(prev => ({
                  ...prev,
                  emiDueDate: Number(e.target.value)
                }))}
                inputProps={{ min: 1, max: 28 }}
                helperText="Day of month when EMI is due (1-28)"
              />
            </Box>

            {newLoan.principalAmount > 0 && newLoan.interestRate > 0 && newLoan.loanTermMonths > 0 && (
              <Box sx={{ width: '100%' }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Calculated EMI: ₹{calculateEMI(
                      newLoan.principalAmount,
                      newLoan.interestRate,
                      newLoan.loanTermMonths
                    ).toLocaleString()}</strong>
                  </Typography>
                </Alert>
              </Box>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateLoan} 
            variant="contained"
            disabled={!newLoan.borrowerId || !newLoan.principalAmount || !newLoan.interestRate || !newLoan.loanTermMonths}
          >
            Create Loan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanManagement;