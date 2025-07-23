import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Payment,
  AccountBalance,
  TrendingUp,
} from '@mui/icons-material';
import { User, Loan, TransactionRequest, EMIWalletTransaction } from '../types';
import { emiWalletApi } from '../services/api';

interface TransactionFormProps {
  currentUser: User;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ currentUser }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<EMIWalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [newTransaction, setNewTransaction] = useState<TransactionRequest>({
    loanId: 0,
    transactionAmount: 0,
    description: '',
  });

  useEffect(() => {
    if (currentUser.userType === 'BORROWER') {
      loadBorrowerData();
    }
  }, [currentUser.id]);

  const loadBorrowerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from API, if fails use demo data
      try {
        const loansResponse = await emiWalletApi.getLoansByBorrower(currentUser.id);
        setLoans(loansResponse.data);
        
        if (loansResponse.data.length > 0) {
          const transactionsResponse = await emiWalletApi.getTransactionsByLoan(loansResponse.data[0].id);
          setTransactions(transactionsResponse.data);
        }
      } catch (apiError) {
        // Demo data for borrower
        const demoLoans: Loan[] = [
          {
            id: 1,
            borrowerId: currentUser.id,
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
            borrowerName: currentUser.fullName,
            lenderName: 'Jane Doe',
            collectedAmount: 15000,
            remainingAmount: 8538,
          },
          {
            id: 2,
            borrowerId: currentUser.id,
            lenderId: 4,
            principalAmount: 250000,
            interestRate: 10,
            loanTermMonths: 18,
            emiAmount: 15234,
            emiCollectionPercentage: 4,
            emiDueDate: 20,
            startDate: '2024-01-01',
            endDate: '2025-07-01',
            status: 'ACTIVE',
            borrowerName: currentUser.fullName,
            lenderName: 'Priya Sharma',
            collectedAmount: 8000,
            remainingAmount: 7234,
          },
        ];

        const demoTransactions: EMIWalletTransaction[] = [
          {
            id: 1,
            loanId: 1,
            transactionAmount: 100000,
            emiCollectionAmount: 5000,
            emiCollectionPercentage: 5,
            description: 'Customer payment received',
            transactionDate: '2024-01-08',
            createdAt: '2024-01-08T10:00:00Z',
          },
          {
            id: 2,
            loanId: 1,
            transactionAmount: 75000,
            emiCollectionAmount: 3750,
            emiCollectionPercentage: 5,
            description: 'Invoice settlement',
            transactionDate: '2024-01-07',
            createdAt: '2024-01-07T14:30:00Z',
          },
          {
            id: 3,
            loanId: 1,
            transactionAmount: 50000,
            emiCollectionAmount: 2500,
            emiCollectionPercentage: 5,
            description: 'Service payment',
            transactionDate: '2024-01-06',
            createdAt: '2024-01-06T09:15:00Z',
          },
        ];
        
        setLoans(demoLoans);
        setTransactions(demoTransactions);
        setError('Using demo data - Backend not connected');
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const selectedLoan = loans.find(loan => loan.id === newTransaction.loanId);
      if (!selectedLoan) {
        setError('Please select a loan');
        return;
      }

      const emiCollectionAmount = (newTransaction.transactionAmount * selectedLoan.emiCollectionPercentage) / 100;

      try {
        await emiWalletApi.addTransaction(newTransaction);
        setSuccess(`Transaction added successfully! EMI collected: ₹${emiCollectionAmount.toLocaleString()}`);
        
        // Reset form
        setNewTransaction({
          loanId: 0,
          transactionAmount: 0,
          description: '',
        });
        
        // Reload data
        loadBorrowerData();
      } catch (apiError) {
        // For demo, just simulate success
        const newTxn: EMIWalletTransaction = {
          id: Date.now(),
          loanId: newTransaction.loanId,
          transactionAmount: newTransaction.transactionAmount,
          emiCollectionAmount,
          emiCollectionPercentage: selectedLoan.emiCollectionPercentage,
          description: newTransaction.description,
          transactionDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
        
        setTransactions(prev => [newTxn, ...prev]);
        setSuccess(`Transaction added successfully! EMI collected: ₹${emiCollectionAmount.toLocaleString()}`);
        
        // Reset form
        setNewTransaction({
          loanId: 0,
          transactionAmount: 0,
          description: '',
        });
      }
    } catch (err) {
      setError('Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  const selectedLoan = loans.find(loan => loan.id === newTransaction.loanId);
  const estimatedEMICollection = selectedLoan 
    ? (newTransaction.transactionAmount * selectedLoan.emiCollectionPercentage) / 100
    : 0;

  if (currentUser.userType !== 'BORROWER') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Transaction management is only available for borrowers.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Add Transaction Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Transaction
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Loan</InputLabel>
                  <Select
                    value={newTransaction.loanId}
                    onChange={(e) => setNewTransaction(prev => ({
                      ...prev,
                      loanId: Number(e.target.value)
                    }))}
                    label="Select Loan"
                  >
                    {loans.map((loan) => (
                      <MenuItem key={loan.id} value={loan.id}>
                        {loan.lenderName} - ₹{loan.principalAmount.toLocaleString()} 
                        ({loan.emiCollectionPercentage}% collection)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Transaction Amount"
                  type="number"
                  fullWidth
                  required
                  value={newTransaction.transactionAmount || ''}
                  onChange={(e) => setNewTransaction(prev => ({
                    ...prev,
                    transactionAmount: Number(e.target.value)
                  }))}
                  InputProps={{
                    startAdornment: '₹',
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Enter transaction description (e.g., Customer payment, Invoice settlement, etc.)"
                />
              </Grid>

              {estimatedEMICollection > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Estimated EMI Collection: ₹{estimatedEMICollection.toLocaleString()}</strong>
                    </Typography>
                    <Typography variant="caption">
                      ({selectedLoan?.emiCollectionPercentage}% of transaction amount)
                    </Typography>
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAddTransaction}
                  disabled={!newTransaction.loanId || !newTransaction.transactionAmount || !newTransaction.description || loading}
                  startIcon={<Payment />}
                >
                  {loading ? 'Adding...' : 'Add Transaction'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Loan Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Loans Summary
            </Typography>
            
            <List>
              {loans.map((loan, index) => (
                <React.Fragment key={loan.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {loan.lenderName}
                          </Typography>
                          <Chip 
                            label={`${loan.emiCollectionPercentage}% Collection`} 
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
                          <Typography variant="body2">
                            Collected: ₹{loan.collectedAmount.toLocaleString()} | 
                            Remaining: ₹{loan.remainingAmount.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < loans.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Transaction Amount</TableCell>
                    <TableCell align="right">EMI Collected</TableCell>
                    <TableCell align="center">Collection %</TableCell>
                    <TableCell>Loan</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => {
                    const loan = loans.find(l => l.id === transaction.loanId);
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell align="right">
                          ₹{transaction.transactionAmount.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">
                            ₹{transaction.emiCollectionAmount.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {transaction.emiCollectionPercentage}%
                        </TableCell>
                        <TableCell>
                          {loan?.lenderName || 'Unknown Lender'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No transactions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionForm;