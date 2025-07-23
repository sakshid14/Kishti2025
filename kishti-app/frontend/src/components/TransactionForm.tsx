import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
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
  Stack,
} from '@mui/material';
import {
  Payment,
  AccountBalance,
  TrendingUp,
} from '@mui/icons-material';
import { emiWalletApi } from '../services/api';
import { User, Loan, EMIWalletTransaction } from '../types';

interface TransactionFormProps {
  currentUser: User;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ currentUser }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<EMIWalletTransaction[]>([]);
  const [newTransaction, setNewTransaction] = useState({
    loanId: 0,
    transactionAmount: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Demo data fallback
  const demoLoans: Loan[] = [
    {
      id: 1,
      borrowerId: currentUser.id,
      lenderId: 2,
      lenderName: 'ABC Finance',
      loanAmount: 500000,
      interestRate: 12,
      tenureMonths: 24,
      monthlyEmiAmount: 23539,
      outstandingAmount: 450000,
      emiCollectionPercentage: 15,
      nextEmiDate: '2024-02-15',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
    },
    {
      id: 2,
      borrowerId: currentUser.id,
      lenderId: 3,
      lenderName: 'XYZ Bank',
      loanAmount: 300000,
      interestRate: 10,
      tenureMonths: 36,
      monthlyEmiAmount: 9677,
      outstandingAmount: 250000,
      emiCollectionPercentage: 20,
      nextEmiDate: '2024-02-20',
      status: 'ACTIVE',
      createdAt: '2024-01-15',
    },
  ];

  const demoTransactions: EMIWalletTransaction[] = [
    {
      id: 1,
      borrowerId: currentUser.id,
      loanId: 1,
      lenderName: 'ABC Finance',
      transactionAmount: 100000,
      emiCollectionAmount: 15000,
      transactionDate: '2024-01-28',
      description: 'Customer payment received',
    },
    {
      id: 2,
      borrowerId: currentUser.id,
      loanId: 2,
      lenderName: 'XYZ Bank',
      transactionAmount: 50000,
      emiCollectionAmount: 10000,
      transactionDate: '2024-01-27',
      description: 'Invoice payment',
    },
  ];

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  const fetchData = async () => {
    try {
      // Try to fetch from API, fall back to demo data
             try {
         const loansResponse = await emiWalletApi.getLoansByBorrower(currentUser.id);
         setLoans(loansResponse.data);
         
         // Get transactions for all loans
         if (loansResponse.data.length > 0) {
           const transactionPromises = loansResponse.data.map(loan => 
             emiWalletApi.getTransactionsByLoan(loan.id)
           );
           const transactionResponses = await Promise.all(transactionPromises);
           const allTransactions = transactionResponses.flatMap(response => response.data);
           setTransactions(allTransactions);
         } else {
           setTransactions([]);
         }
      } catch (apiError) {
        console.log('API not available, using demo data');
        setLoans(demoLoans);
        setTransactions(demoTransactions);
      }
    } catch (err) {
      setError('Failed to fetch data');
      setLoans(demoLoans);
      setTransactions(demoTransactions);
    }
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.loanId || !newTransaction.transactionAmount || !newTransaction.description) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedLoan = loans.find(loan => loan.id === newTransaction.loanId);
      if (!selectedLoan) {
        setError('Invalid loan selected');
        return;
      }

      const emiCollectionAmount = (newTransaction.transactionAmount * selectedLoan.emiCollectionPercentage) / 100;

             try {
         await emiWalletApi.addTransaction({
           loanId: newTransaction.loanId,
           transactionAmount: newTransaction.transactionAmount,
           description: newTransaction.description,
         });
        setSuccess('Transaction added successfully!');
        fetchData();
      } catch (apiError) {
        // Simulate success for demo
        const newDemoTransaction: EMIWalletTransaction = {
          id: Date.now(),
          borrowerId: currentUser.id,
          loanId: newTransaction.loanId,
          lenderName: selectedLoan.lenderName,
          transactionAmount: newTransaction.transactionAmount,
          emiCollectionAmount,
          transactionDate: new Date().toISOString().split('T')[0],
          description: newTransaction.description,
        };
        
        setTransactions(prev => [newDemoTransaction, ...prev]);
        setSuccess('Transaction added successfully! (Demo mode)');
        
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

      <Stack spacing={3}>
        {/* Add Transaction Form and Loan Summary Row */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Add Transaction Form */}
          <Paper sx={{ p: 3, flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              Add New Transaction
            </Typography>

            <Stack spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Select Loan</InputLabel>
                <Select
                  value={newTransaction.loanId}
                  onChange={(e) => setNewTransaction({ ...newTransaction, loanId: Number(e.target.value) })}
                >
                  {loans.map((loan) => (
                    <MenuItem key={loan.id} value={loan.id}>
                      {loan.lenderName} - ₹{loan.loanAmount.toLocaleString()} ({loan.emiCollectionPercentage}% EMI)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Transaction Amount"
                type="number"
                value={newTransaction.transactionAmount}
                onChange={(e) => setNewTransaction({ ...newTransaction, transactionAmount: Number(e.target.value) })}
                helperText={`Estimated EMI Collection: ₹${estimatedEMICollection.toFixed(2)}`}
              />

              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
              />

              {selectedLoan && (
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>EMI Collection Details:</strong><br />
                    • Transaction Amount: ₹{newTransaction.transactionAmount.toLocaleString()}<br />
                    • EMI Percentage: {selectedLoan.emiCollectionPercentage}%<br />
                    • Amount to be collected: ₹{estimatedEMICollection.toFixed(2)}<br />
                    • Remaining for business: ₹{(newTransaction.transactionAmount - estimatedEMICollection).toFixed(2)}
                  </Typography>
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                onClick={handleAddTransaction}
                disabled={!newTransaction.loanId || !newTransaction.transactionAmount || !newTransaction.description || loading}
                startIcon={<Payment />}
              >
                {loading ? 'Adding...' : 'Add Transaction'}
              </Button>
            </Stack>
          </Paper>

          {/* Loan Summary */}
          <Paper sx={{ p: 3, flex: 1 }}>
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
                          <Typography variant="subtitle1" fontWeight="bold">
                            {loan.lenderName}
                          </Typography>
                          <Chip 
                            label={`${loan.emiCollectionPercentage}% EMI`} 
                            size="small" 
                            color="primary" 
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Loan Amount: ₹{loan.loanAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Monthly EMI: ₹{loan.monthlyEmiAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Outstanding: ₹{loan.outstandingAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Next EMI: {loan.nextEmiDate}
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
        </Box>

        {/* Recent Transactions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Lender</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Transaction Amount</TableCell>
                  <TableCell align="right">EMI Collected</TableCell>
                  <TableCell align="right">Remaining</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                                 {transactions.slice(0, 5).map((transaction) => {
                   const loan = loans.find(l => l.id === transaction.loanId);
                   return (
                     <TableRow key={transaction.id}>
                       <TableCell>{transaction.transactionDate}</TableCell>
                       <TableCell>{transaction.lenderName || loan?.lenderName || 'Unknown'}</TableCell>
                       <TableCell>{transaction.description}</TableCell>
                       <TableCell align="right">₹{transaction.transactionAmount.toLocaleString()}</TableCell>
                       <TableCell align="right">₹{transaction.emiCollectionAmount.toLocaleString()}</TableCell>
                       <TableCell align="right">₹{(transaction.transactionAmount - transaction.emiCollectionAmount).toLocaleString()}</TableCell>
                     </TableRow>
                   );
                 })}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        No transactions found. Add your first transaction above.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Stack>
    </Box>
  );
};

export default TransactionForm;