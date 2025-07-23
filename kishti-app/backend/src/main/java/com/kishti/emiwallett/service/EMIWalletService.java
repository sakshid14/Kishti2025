package com.kishti.emiwallett.service;

import com.kishti.emiwallett.dto.DashboardDTO;
import com.kishti.emiwallett.dto.LoanDTO;
import com.kishti.emiwallett.model.*;
import com.kishti.emiwallett.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EMIWalletService {

    @Autowired
    private LoanRepository loanRepository;
    
    @Autowired
    private EMIWalletTransactionRepository walletTransactionRepository;
    
    @Autowired
    private EMIPaymentRepository emiPaymentRepository;
    
    @Autowired
    private UserRepository userRepository;

    public LoanDTO createLoan(LoanDTO loanDTO) {
        User borrower = userRepository.findById(loanDTO.getBorrowerId())
                .orElseThrow(() -> new RuntimeException("Borrower not found"));
        User lender = userRepository.findById(loanDTO.getLenderId())
                .orElseThrow(() -> new RuntimeException("Lender not found"));

        Loan loan = new Loan(borrower, lender, loanDTO.getPrincipalAmount(),
                loanDTO.getInterestRate(), loanDTO.getTenureMonths(),
                loanDTO.getEmiDayOfMonth(), loanDTO.getEmiCollectionPercentage());
        
        loan.setStatus(Loan.LoanStatus.ACTIVE);
        Loan savedLoan = loanRepository.save(loan);
        
        return new LoanDTO(savedLoan);
    }

    public void processPayment(Long loanId, BigDecimal paymentAmount, String paymentReference) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        // Calculate EMI collection amount
        BigDecimal emiCollectionAmount = paymentAmount
                .multiply(loan.getEmiCollectionPercentage())
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);

        // Create wallet transaction
        EMIWalletTransaction transaction = new EMIWalletTransaction(
                loan, paymentAmount, emiCollectionAmount, paymentReference,
                "Payment received - EMI collected", 
                EMIWalletTransaction.TransactionType.PAYMENT_RECEIVED
        );
        
        walletTransactionRepository.save(transaction);
    }

    public List<LoanDTO> getLoansByBorrower(Long borrowerId) {
        User borrower = userRepository.findById(borrowerId)
                .orElseThrow(() -> new RuntimeException("Borrower not found"));
                
        return loanRepository.findByBorrower(borrower).stream()
                .map(loan -> {
                    LoanDTO dto = new LoanDTO(loan);
                    dto.setTotalCollectedAmount(getTotalCollectedAmount(loan.getId()));
                    dto.setRemainingEmiAmount(dto.getEmiAmount().subtract(
                        getCollectedAmountThisMonth(loan.getId())));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<LoanDTO> getLoansByLender(Long lenderId) {
        User lender = userRepository.findById(lenderId)
                .orElseThrow(() -> new RuntimeException("Lender not found"));
                
        return loanRepository.findByLender(lender).stream()
                .map(loan -> {
                    LoanDTO dto = new LoanDTO(loan);
                    dto.setTotalCollectedAmount(getTotalCollectedAmount(loan.getId()));
                    dto.setRemainingEmiAmount(dto.getEmiAmount().subtract(
                        getCollectedAmountThisMonth(loan.getId())));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public BigDecimal getTotalCollectedAmount(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        BigDecimal total = walletTransactionRepository.getTotalCollectedAmountByLoan(loan);
        return total != null ? total : BigDecimal.ZERO;
    }

    public BigDecimal getCollectedAmountThisMonth(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
                
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);
        
        BigDecimal collected = walletTransactionRepository.getCollectedAmountByLoanAndDateRange(
                loan, startOfMonth, endOfMonth);
        return collected != null ? collected : BigDecimal.ZERO;
    }

    public DashboardDTO.BorrowerDashboard getBorrowerDashboard(Long borrowerId) {
        User borrower = userRepository.findById(borrowerId)
                .orElseThrow(() -> new RuntimeException("Borrower not found"));

        DashboardDTO.BorrowerDashboard dashboard = new DashboardDTO.BorrowerDashboard();
        
        List<Loan> activeLoans = loanRepository.findByBorrowerAndStatus(borrower, Loan.LoanStatus.ACTIVE);
        
        BigDecimal totalOutstanding = loanRepository.getTotalOutstandingAmountByBorrower(borrower);
        BigDecimal totalMonthlyEMI = loanRepository.getTotalMonthlyEMIByBorrower(borrower);
        
        dashboard.setTotalOutstandingAmount(totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO);
        dashboard.setTotalMonthlyEMI(totalMonthlyEMI != null ? totalMonthlyEMI : BigDecimal.ZERO);
        dashboard.setActiveLoanCount(activeLoans.size());
        
        // Calculate total collected this month
        BigDecimal totalCollectedThisMonth = BigDecimal.ZERO;
        for (Loan loan : activeLoans) {
            totalCollectedThisMonth = totalCollectedThisMonth.add(getCollectedAmountThisMonth(loan.getId()));
        }
        dashboard.setTotalCollectedThisMonth(totalCollectedThisMonth);
        dashboard.setRemainingEMIForThisMonth(dashboard.getTotalMonthlyEMI().subtract(totalCollectedThisMonth));
        
        // Set loan summaries
        List<DashboardDTO.LoanSummary> loanSummaries = activeLoans.stream()
                .map(this::createLoanSummary)
                .collect(Collectors.toList());
        dashboard.setLoanSummaries(loanSummaries);
        
        // Set recent transactions
        List<EMIWalletTransaction> recentTransactions = walletTransactionRepository
                .findByBorrowerIdOrderByCreatedAtDesc(borrowerId);
        List<DashboardDTO.RecentTransaction> recentTxns = recentTransactions.stream()
                .limit(10)
                .map(this::createRecentTransaction)
                .collect(Collectors.toList());
        dashboard.setRecentTransactions(recentTxns);
        
        return dashboard;
    }

    public DashboardDTO.LenderDashboard getLenderDashboard(Long lenderId) {
        User lender = userRepository.findById(lenderId)
                .orElseThrow(() -> new RuntimeException("Lender not found"));

        DashboardDTO.LenderDashboard dashboard = new DashboardDTO.LenderDashboard();
        
        BigDecimal totalLoanAmount = loanRepository.getTotalLoanAmountByLender(lender);
        BigDecimal totalOutstanding = loanRepository.getTotalOutstandingAmountByLender(lender);
        Long activeBorrowersCount = loanRepository.getActiveBorrowersCountByLender(lender);
        
        dashboard.setTotalLoanAmount(totalLoanAmount != null ? totalLoanAmount : BigDecimal.ZERO);
        dashboard.setTotalOutstandingAmount(totalOutstanding != null ? totalOutstanding : BigDecimal.ZERO);
        dashboard.setActiveBorrowersCount(activeBorrowersCount != null ? activeBorrowersCount.intValue() : 0);
        
        // Calculate total collected this month from all borrowers
        List<Loan> lenderLoans = loanRepository.findByLender(lender);
        BigDecimal totalCollectedThisMonth = BigDecimal.ZERO;
        for (Loan loan : lenderLoans) {
            totalCollectedThisMonth = totalCollectedThisMonth.add(getCollectedAmountThisMonth(loan.getId()));
        }
        dashboard.setTotalCollectedThisMonth(totalCollectedThisMonth);
        
        // Set borrower summaries
        List<DashboardDTO.BorrowerSummary> borrowerSummaries = lenderLoans.stream()
                .map(this::createBorrowerSummary)
                .collect(Collectors.toList());
        dashboard.setBorrowerSummaries(borrowerSummaries);
        
        // Set recent payments
        List<EMIPayment> recentPayments = emiPaymentRepository
                .findByLenderIdOrderByDueDateDesc(lenderId);
        List<DashboardDTO.RecentPayment> recentPmts = recentPayments.stream()
                .limit(10)
                .map(this::createRecentPayment)
                .collect(Collectors.toList());
        dashboard.setRecentPayments(recentPmts);
        
        return dashboard;
    }

    @Scheduled(cron = "0 0 9 * * ?") // Run daily at 9 AM
    public void processScheduledEMIPayments() {
        int today = LocalDate.now().getDayOfMonth();
        List<Loan> loansWithEmiDue = loanRepository.findLoansWithEmiDueToday(today);
        
        for (Loan loan : loansWithEmiDue) {
            BigDecimal collectedAmount = getTotalCollectedAmount(loan.getId());
            
            if (collectedAmount.compareTo(loan.getEmiAmount()) >= 0) {
                // Create EMI payment record
                EMIPayment emiPayment = new EMIPayment(loan, loan.getEmiAmount(), LocalDate.now());
                emiPayment.setPaymentDate(LocalDate.now());
                emiPayment.setStatus(EMIPayment.PaymentStatus.COMPLETED);
                emiPayment.setTransactionReference("AUTO_PAYMENT_" + System.currentTimeMillis());
                emiPayment.setPaymentMethod("EMI_WALLET");
                
                emiPaymentRepository.save(emiPayment);
                
                // Update loan outstanding amount
                loan.setOutstandingAmount(loan.getOutstandingAmount().subtract(loan.getEmiAmount()));
                if (loan.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    loan.setStatus(Loan.LoanStatus.COMPLETED);
                }
                loanRepository.save(loan);
                
                // Create wallet transaction for EMI payment
                EMIWalletTransaction transaction = new EMIWalletTransaction(
                        loan, loan.getEmiAmount(), loan.getEmiAmount(),
                        emiPayment.getTransactionReference(),
                        "Automatic EMI payment to lender",
                        EMIWalletTransaction.TransactionType.EMI_COLLECTION
                );
                walletTransactionRepository.save(transaction);
            }
        }
    }

    private DashboardDTO.LoanSummary createLoanSummary(Loan loan) {
        DashboardDTO.LoanSummary summary = new DashboardDTO.LoanSummary();
        summary.setLoanId(loan.getId());
        summary.setLenderName(loan.getLender().getFullName());
        summary.setEmiAmount(loan.getEmiAmount());
        summary.setCollectedAmount(getCollectedAmountThisMonth(loan.getId()));
        summary.setRemainingAmount(loan.getEmiAmount().subtract(summary.getCollectedAmount()));
        summary.setStatus(loan.getStatus().toString());
        return summary;
    }

    private DashboardDTO.BorrowerSummary createBorrowerSummary(Loan loan) {
        DashboardDTO.BorrowerSummary summary = new DashboardDTO.BorrowerSummary();
        summary.setBorrowerId(loan.getBorrower().getId());
        summary.setBorrowerName(loan.getBorrower().getFullName());
        summary.setEmiWalletBalance(getCollectedAmountThisMonth(loan.getId()));
        summary.setMonthlyEMI(loan.getEmiAmount());
        summary.setStatus(loan.getStatus().toString());
        return summary;
    }

    private DashboardDTO.RecentTransaction createRecentTransaction(EMIWalletTransaction transaction) {
        DashboardDTO.RecentTransaction recent = new DashboardDTO.RecentTransaction();
        recent.setDate(transaction.getCreatedAt().toLocalDate().toString());
        recent.setAmount(transaction.getTransactionAmount());
        recent.setEmiCollected(transaction.getEmiCollectionAmount());
        recent.setDescription(transaction.getDescription());
        return recent;
    }

    private DashboardDTO.RecentPayment createRecentPayment(EMIPayment payment) {
        DashboardDTO.RecentPayment recent = new DashboardDTO.RecentPayment();
        recent.setDate(payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : "");
        recent.setBorrowerName(payment.getLoan().getBorrower().getFullName());
        recent.setAmount(payment.getPaymentAmount());
        recent.setStatus(payment.getStatus().toString());
        return recent;
    }
}