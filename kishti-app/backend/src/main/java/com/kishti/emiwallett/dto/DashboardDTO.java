package com.kishti.emiwallett.dto;

import java.math.BigDecimal;
import java.util.List;

public class DashboardDTO {
    
    // Borrower Dashboard Data
    private BorrowerDashboard borrowerDashboard;
    
    // Lender Dashboard Data  
    private LenderDashboard lenderDashboard;
    
    public static class BorrowerDashboard {
        private BigDecimal totalOutstandingAmount;
        private BigDecimal totalMonthlyEMI;
        private BigDecimal totalCollectedThisMonth;
        private BigDecimal remainingEMIForThisMonth;
        private int activeLoanCount;
        private List<LoanSummary> loanSummaries;
        private List<RecentTransaction> recentTransactions;
        
        // Getters and Setters
        public BigDecimal getTotalOutstandingAmount() { return totalOutstandingAmount; }
        public void setTotalOutstandingAmount(BigDecimal totalOutstandingAmount) { 
            this.totalOutstandingAmount = totalOutstandingAmount; 
        }
        
        public BigDecimal getTotalMonthlyEMI() { return totalMonthlyEMI; }
        public void setTotalMonthlyEMI(BigDecimal totalMonthlyEMI) { this.totalMonthlyEMI = totalMonthlyEMI; }
        
        public BigDecimal getTotalCollectedThisMonth() { return totalCollectedThisMonth; }
        public void setTotalCollectedThisMonth(BigDecimal totalCollectedThisMonth) { 
            this.totalCollectedThisMonth = totalCollectedThisMonth; 
        }
        
        public BigDecimal getRemainingEMIForThisMonth() { return remainingEMIForThisMonth; }
        public void setRemainingEMIForThisMonth(BigDecimal remainingEMIForThisMonth) { 
            this.remainingEMIForThisMonth = remainingEMIForThisMonth; 
        }
        
        public int getActiveLoanCount() { return activeLoanCount; }
        public void setActiveLoanCount(int activeLoanCount) { this.activeLoanCount = activeLoanCount; }
        
        public List<LoanSummary> getLoanSummaries() { return loanSummaries; }
        public void setLoanSummaries(List<LoanSummary> loanSummaries) { this.loanSummaries = loanSummaries; }
        
        public List<RecentTransaction> getRecentTransactions() { return recentTransactions; }
        public void setRecentTransactions(List<RecentTransaction> recentTransactions) { 
            this.recentTransactions = recentTransactions; 
        }
    }
    
    public static class LenderDashboard {
        private BigDecimal totalLoanAmount;
        private BigDecimal totalOutstandingAmount;
        private BigDecimal totalCollectedThisMonth;
        private int activeBorrowersCount;
        private List<BorrowerSummary> borrowerSummaries;
        private List<RecentPayment> recentPayments;
        
        // Getters and Setters
        public BigDecimal getTotalLoanAmount() { return totalLoanAmount; }
        public void setTotalLoanAmount(BigDecimal totalLoanAmount) { this.totalLoanAmount = totalLoanAmount; }
        
        public BigDecimal getTotalOutstandingAmount() { return totalOutstandingAmount; }
        public void setTotalOutstandingAmount(BigDecimal totalOutstandingAmount) { 
            this.totalOutstandingAmount = totalOutstandingAmount; 
        }
        
        public BigDecimal getTotalCollectedThisMonth() { return totalCollectedThisMonth; }
        public void setTotalCollectedThisMonth(BigDecimal totalCollectedThisMonth) { 
            this.totalCollectedThisMonth = totalCollectedThisMonth; 
        }
        
        public int getActiveBorrowersCount() { return activeBorrowersCount; }
        public void setActiveBorrowersCount(int activeBorrowersCount) { 
            this.activeBorrowersCount = activeBorrowersCount; 
        }
        
        public List<BorrowerSummary> getBorrowerSummaries() { return borrowerSummaries; }
        public void setBorrowerSummaries(List<BorrowerSummary> borrowerSummaries) { 
            this.borrowerSummaries = borrowerSummaries; 
        }
        
        public List<RecentPayment> getRecentPayments() { return recentPayments; }
        public void setRecentPayments(List<RecentPayment> recentPayments) { 
            this.recentPayments = recentPayments; 
        }
    }
    
    public static class LoanSummary {
        private Long loanId;
        private String lenderName;
        private BigDecimal emiAmount;
        private BigDecimal collectedAmount;
        private BigDecimal remainingAmount;
        private String status;
        
        // Getters and Setters
        public Long getLoanId() { return loanId; }
        public void setLoanId(Long loanId) { this.loanId = loanId; }
        
        public String getLenderName() { return lenderName; }
        public void setLenderName(String lenderName) { this.lenderName = lenderName; }
        
        public BigDecimal getEmiAmount() { return emiAmount; }
        public void setEmiAmount(BigDecimal emiAmount) { this.emiAmount = emiAmount; }
        
        public BigDecimal getCollectedAmount() { return collectedAmount; }
        public void setCollectedAmount(BigDecimal collectedAmount) { this.collectedAmount = collectedAmount; }
        
        public BigDecimal getRemainingAmount() { return remainingAmount; }
        public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    public static class BorrowerSummary {
        private Long borrowerId;
        private String borrowerName;
        private BigDecimal emiWalletBalance;
        private BigDecimal monthlyEMI;
        private String status;
        
        // Getters and Setters
        public Long getBorrowerId() { return borrowerId; }
        public void setBorrowerId(Long borrowerId) { this.borrowerId = borrowerId; }
        
        public String getBorrowerName() { return borrowerName; }
        public void setBorrowerName(String borrowerName) { this.borrowerName = borrowerName; }
        
        public BigDecimal getEmiWalletBalance() { return emiWalletBalance; }
        public void setEmiWalletBalance(BigDecimal emiWalletBalance) { this.emiWalletBalance = emiWalletBalance; }
        
        public BigDecimal getMonthlyEMI() { return monthlyEMI; }
        public void setMonthlyEMI(BigDecimal monthlyEMI) { this.monthlyEMI = monthlyEMI; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    public static class RecentTransaction {
        private String date;
        private BigDecimal amount;
        private BigDecimal emiCollected;
        private String description;
        
        // Getters and Setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public BigDecimal getEmiCollected() { return emiCollected; }
        public void setEmiCollected(BigDecimal emiCollected) { this.emiCollected = emiCollected; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
    
    public static class RecentPayment {
        private String date;
        private String borrowerName;
        private BigDecimal amount;
        private String status;
        
        // Getters and Setters
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        
        public String getBorrowerName() { return borrowerName; }
        public void setBorrowerName(String borrowerName) { this.borrowerName = borrowerName; }
        
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
    
    // Main DTO Getters and Setters
    public BorrowerDashboard getBorrowerDashboard() { return borrowerDashboard; }
    public void setBorrowerDashboard(BorrowerDashboard borrowerDashboard) { 
        this.borrowerDashboard = borrowerDashboard; 
    }
    
    public LenderDashboard getLenderDashboard() { return lenderDashboard; }
    public void setLenderDashboard(LenderDashboard lenderDashboard) { 
        this.lenderDashboard = lenderDashboard; 
    }
}