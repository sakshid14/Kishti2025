export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  userType: 'BORROWER' | 'LENDER';
  businessName?: string;
  businessAddress?: string;
  panNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: number;
  borrowerId: number;
  lenderId: number;
  principalAmount: number;
  interestRate: number;
  loanTermMonths: number;
  emiAmount: number;
  emiCollectionPercentage: number;
  emiDueDate: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'PENDING';
  borrowerName: string;
  lenderName: string;
  collectedAmount: number;
  remainingAmount: number;
}

export interface EMIWalletTransaction {
  id: number;
  loanId: number;
  transactionAmount: number;
  emiCollectionAmount: number;
  emiCollectionPercentage: number;
  description: string;
  transactionDate: string;
  createdAt: string;
}

export interface EMIPayment {
  id: number;
  loanId: number;
  paymentAmount: number;
  paymentDate: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'OVERDUE';
  transactionReference?: string;
  failureReason?: string;
  createdAt: string;
}

export interface BorrowerDashboard {
  totalOutstandingAmount: number;
  totalMonthlyEMI: number;
  totalCollectedThisMonth: number;
  remainingEMIForThisMonth: number;
  activeLoanCount: number;
  loanSummaries: LoanSummary[];
  recentTransactions: RecentTransaction[];
}

export interface LenderDashboard {
  totalLoanAmount: number;
  totalOutstandingAmount: number;
  totalMonthlyEMIExpected: number;
  totalCollectedThisMonth: number;
  activeBorrowerCount: number;
  borrowerSummaries: BorrowerSummary[];
  upcomingPayments: UpcomingPayment[];
}

export interface LoanSummary {
  loanId: number;
  lenderName: string;
  principalAmount: number;
  emiAmount: number;
  collectedAmount: number;
  remainingForThisMonth: number;
  status: string;
  nextEMIDate: string;
}

export interface BorrowerSummary {
  borrowerId: number;
  borrowerName: string;
  totalLoanAmount: number;
  totalOutstanding: number;
  monthlyEMI: number;
  walletBalance: number;
  status: string;
  lastPaymentDate?: string;
}

export interface RecentTransaction {
  id: number;
  date: string;
  amount: number;
  emiCollected: number;
  description: string;
  loanId: number;
}

export interface UpcomingPayment {
  paymentId: number;
  loanId: number;
  borrowerName: string;
  amount: number;
  dueDate: string;
  status: string;
}

export interface TransactionRequest {
  loanId: number;
  transactionAmount: number;
  description: string;
}

export interface LoanRequest {
  borrowerId: number;
  lenderId: number;
  principalAmount: number;
  interestRate: number;
  loanTermMonths: number;
  emiCollectionPercentage: number;
  emiDueDate: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}