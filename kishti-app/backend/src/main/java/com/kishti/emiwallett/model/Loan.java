package com.kishti.emiwallett.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "loans")
public class Loan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lender_id", nullable = false)
    private User lender;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "principal_amount", precision = 15, scale = 2)
    private BigDecimal principalAmount;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate;

    @NotNull
    @Positive
    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "emi_amount", precision = 15, scale = 2)
    private BigDecimal emiAmount;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "outstanding_amount", precision = 15, scale = 2)
    private BigDecimal outstandingAmount;

    @NotNull
    @Column(name = "emi_day_of_month")
    private Integer emiDayOfMonth;

    @DecimalMin("0.0")
    @DecimalMax("100.0")
    @Column(name = "emi_collection_percentage", precision = 5, scale = 2)
    private BigDecimal emiCollectionPercentage;

    @Column(name = "loan_start_date")
    private LocalDate loanStartDate;

    @Column(name = "loan_end_date")
    private LocalDate loanEndDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EMIWalletTransaction> walletTransactions;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EMIPayment> emiPayments;

    public enum LoanStatus {
        PENDING, ACTIVE, COMPLETED, DEFAULTED, CANCELLED
    }

    // Constructors
    public Loan() {}

    public Loan(User borrower, User lender, BigDecimal principalAmount, 
                BigDecimal interestRate, Integer tenureMonths, Integer emiDayOfMonth,
                BigDecimal emiCollectionPercentage) {
        this.borrower = borrower;
        this.lender = lender;
        this.principalAmount = principalAmount;
        this.interestRate = interestRate;
        this.tenureMonths = tenureMonths;
        this.emiDayOfMonth = emiDayOfMonth;
        this.emiCollectionPercentage = emiCollectionPercentage;
        this.outstandingAmount = principalAmount;
        this.status = LoanStatus.PENDING;
        this.loanStartDate = LocalDate.now();
        this.loanEndDate = LocalDate.now().plusMonths(tenureMonths);
        
        // Calculate EMI using formula: P * r * (1+r)^n / ((1+r)^n - 1)
        BigDecimal monthlyRate = interestRate.divide(BigDecimal.valueOf(1200), 10, java.math.RoundingMode.HALF_UP);
        BigDecimal factor = monthlyRate.add(BigDecimal.ONE).pow(tenureMonths);
        this.emiAmount = principalAmount.multiply(monthlyRate).multiply(factor)
                .divide(factor.subtract(BigDecimal.ONE), 2, java.math.RoundingMode.HALF_UP);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getBorrower() { return borrower; }
    public void setBorrower(User borrower) { this.borrower = borrower; }

    public User getLender() { return lender; }
    public void setLender(User lender) { this.lender = lender; }

    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }

    public BigDecimal getEmiAmount() { return emiAmount; }
    public void setEmiAmount(BigDecimal emiAmount) { this.emiAmount = emiAmount; }

    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }

    public Integer getEmiDayOfMonth() { return emiDayOfMonth; }
    public void setEmiDayOfMonth(Integer emiDayOfMonth) { this.emiDayOfMonth = emiDayOfMonth; }

    public BigDecimal getEmiCollectionPercentage() { return emiCollectionPercentage; }
    public void setEmiCollectionPercentage(BigDecimal emiCollectionPercentage) { 
        this.emiCollectionPercentage = emiCollectionPercentage; 
    }

    public LocalDate getLoanStartDate() { return loanStartDate; }
    public void setLoanStartDate(LocalDate loanStartDate) { this.loanStartDate = loanStartDate; }

    public LocalDate getLoanEndDate() { return loanEndDate; }
    public void setLoanEndDate(LocalDate loanEndDate) { this.loanEndDate = loanEndDate; }

    public LoanStatus getStatus() { return status; }
    public void setStatus(LoanStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<EMIWalletTransaction> getWalletTransactions() { return walletTransactions; }
    public void setWalletTransactions(List<EMIWalletTransaction> walletTransactions) { 
        this.walletTransactions = walletTransactions; 
    }

    public List<EMIPayment> getEmiPayments() { return emiPayments; }
    public void setEmiPayments(List<EMIPayment> emiPayments) { this.emiPayments = emiPayments; }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}