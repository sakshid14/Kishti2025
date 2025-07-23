import axios from 'axios';
import {
  User,
  Loan,
  BorrowerDashboard,
  LenderDashboard,
  EMIWalletTransaction,
  EMIPayment,
  TransactionRequest,
  LoanRequest,
  ApiResponse
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User API
export const userApi = {
  getAllUsers: () => apiClient.get<User[]>('/users'),
  getUserById: (id: number) => apiClient.get<User>(`/users/${id}`),
  createUser: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiClient.post<User>('/users', user),
  updateUser: (id: number, user: Partial<User>) => 
    apiClient.put<User>(`/users/${id}`, user),
  deleteUser: (id: number) => apiClient.delete(`/users/${id}`),
  getUsersByType: (userType: 'BORROWER' | 'LENDER') => 
    apiClient.get<User[]>(`/users/type/${userType}`),
  searchUsers: (userType: 'BORROWER' | 'LENDER', searchTerm: string) =>
    apiClient.get<User[]>(`/users/search`, { params: { userType, searchTerm } }),
};

// EMI Wallet API
export const emiWalletApi = {
  // Loan management
  createLoan: (loan: LoanRequest) => 
    apiClient.post<Loan>('/emi-wallet/loans', loan),
  getLoansByBorrower: (borrowerId: number) => 
    apiClient.get<Loan[]>(`/emi-wallet/loans/borrower/${borrowerId}`),
  getLoansByLender: (lenderId: number) => 
    apiClient.get<Loan[]>(`/emi-wallet/loans/lender/${lenderId}`),
  getLoanById: (loanId: number) => 
    apiClient.get<Loan>(`/emi-wallet/loans/${loanId}`),
  updateLoanStatus: (loanId: number, status: string) =>
    apiClient.put(`/emi-wallet/loans/${loanId}/status`, { status }),

  // Transaction management
  addTransaction: (transaction: TransactionRequest) =>
    apiClient.post<EMIWalletTransaction>('/emi-wallet/transactions', transaction),
  getTransactionsByLoan: (loanId: number) =>
    apiClient.get<EMIWalletTransaction[]>(`/emi-wallet/transactions/loan/${loanId}`),
  getLoanWalletBalance: (loanId: number) =>
    apiClient.get<{ balance: number }>(`/emi-wallet/loans/${loanId}/wallet-balance`),

  // Dashboard data
  getBorrowerDashboard: (borrowerId: number) =>
    apiClient.get<BorrowerDashboard>(`/emi-wallet/dashboard/borrower/${borrowerId}`),
  getLenderDashboard: (lenderId: number) =>
    apiClient.get<LenderDashboard>(`/emi-wallet/dashboard/lender/${lenderId}`),

  // EMI Payments
  getEMIPaymentsByLoan: (loanId: number) =>
    apiClient.get<EMIPayment[]>(`/emi-wallet/payments/loan/${loanId}`),
  getPendingPayments: () =>
    apiClient.get<EMIPayment[]>('/emi-wallet/payments/pending'),
  processEMIPayment: (paymentId: number) =>
    apiClient.post(`/emi-wallet/payments/${paymentId}/process`),

  // Analytics
  getMonthlyCollections: (userId: number, year: number) =>
    apiClient.get<{ month: number; amount: number }[]>(
      `/emi-wallet/analytics/monthly-collections/${userId}`,
      { params: { year } }
    ),
  getPaymentHistory: (loanId: number) =>
    apiClient.get<EMIPayment[]>(`/emi-wallet/analytics/payment-history/${loanId}`),
};

// Authentication API (placeholder for future implementation)
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<{ token: string; user: User }>('/auth/login', { username, password }),
  register: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) =>
    apiClient.post<{ user: User }>('/auth/register', user),
  logout: () => apiClient.post('/auth/logout'),
  getCurrentUser: () => apiClient.get<User>('/auth/me'),
};

export default apiClient;