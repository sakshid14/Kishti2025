package com.kishti.emiwallett.dto;

import com.kishti.emiwallett.model.Loan;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LoanDTO {
    private Long id;
    
    @NotNull(message = "Borrower ID is required")
    private Long borrowerId;
    
    @NotNull(message = "Lender ID is required")
    private Long lenderId;
    
    @NotNull(message = "Principal amount is required")
    @DecimalMin(value = "0.0", message = "Principal amount must be positive")
    private BigDecimal principalAmount;
    
    @NotNull(message = "Interest rate is required")
    @DecimalMin(value = "0.0", message = "Interest rate must be positive")
    private BigDecimal interestRate;
    
    @NotNull(message = "Tenure is required")
    @Positive(message = "Tenure must be positive")
    private Integer tenureMonths;
    
    @NotNull(message = "EMI day is required")
    private Integer emiDayOfMonth;
    
    @DecimalMin(value = "0.0", message = "EMI collection percentage must be positive")
    private BigDecimal emiCollectionPercentage;
    
    private BigDecimal emiAmount;
    private BigDecimal outstandingAmount;
    private LocalDate loanStartDate;
    private LocalDate loanEndDate;
    private Loan.LoanStatus status;
    
    // Additional fields for display
    private String borrowerName;
    private String lenderName;
    private BigDecimal totalCollectedAmount;
    private BigDecimal remainingEmiAmount;

    // Constructors
    public LoanDTO() {}

    public LoanDTO(Loan loan) {
        this.id = loan.getId();
        this.borrowerId = loan.getBorrower().getId();
        this.lenderId = loan.getLender().getId();
        this.principalAmount = loan.getPrincipalAmount();
        this.interestRate = loan.getInterestRate();
        this.tenureMonths = loan.getTenureMonths();
        this.emiDayOfMonth = loan.getEmiDayOfMonth();
        this.emiCollectionPercentage = loan.getEmiCollectionPercentage();
        this.emiAmount = loan.getEmiAmount();
        this.outstandingAmount = loan.getOutstandingAmount();
        this.loanStartDate = loan.getLoanStartDate();
        this.loanEndDate = loan.getLoanEndDate();
        this.status = loan.getStatus();
        this.borrowerName = loan.getBorrower().getFullName();
        this.lenderName = loan.getLender().getFullName();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBorrowerId() { return borrowerId; }
    public void setBorrowerId(Long borrowerId) { this.borrowerId = borrowerId; }

    public Long getLenderId() { return lenderId; }
    public void setLenderId(Long lenderId) { this.lenderId = lenderId; }

    public BigDecimal getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(BigDecimal principalAmount) { this.principalAmount = principalAmount; }

    public BigDecimal getInterestRate() { return interestRate; }
    public void setInterestRate(BigDecimal interestRate) { this.interestRate = interestRate; }

    public Integer getTenureMonths() { return tenureMonths; }
    public void setTenureMonths(Integer tenureMonths) { this.tenureMonths = tenureMonths; }

    public Integer getEmiDayOfMonth() { return emiDayOfMonth; }
    public void setEmiDayOfMonth(Integer emiDayOfMonth) { this.emiDayOfMonth = emiDayOfMonth; }

    public BigDecimal getEmiCollectionPercentage() { return emiCollectionPercentage; }
    public void setEmiCollectionPercentage(BigDecimal emiCollectionPercentage) { 
        this.emiCollectionPercentage = emiCollectionPercentage; 
    }

    public BigDecimal getEmiAmount() { return emiAmount; }
    public void setEmiAmount(BigDecimal emiAmount) { this.emiAmount = emiAmount; }

    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }

    public LocalDate getLoanStartDate() { return loanStartDate; }
    public void setLoanStartDate(LocalDate loanStartDate) { this.loanStartDate = loanStartDate; }

    public LocalDate getLoanEndDate() { return loanEndDate; }
    public void setLoanEndDate(LocalDate loanEndDate) { this.loanEndDate = loanEndDate; }

    public Loan.LoanStatus getStatus() { return status; }
    public void setStatus(Loan.LoanStatus status) { this.status = status; }

    public String getBorrowerName() { return borrowerName; }
    public void setBorrowerName(String borrowerName) { this.borrowerName = borrowerName; }

    public String getLenderName() { return lenderName; }
    public void setLenderName(String lenderName) { this.lenderName = lenderName; }

    public BigDecimal getTotalCollectedAmount() { return totalCollectedAmount; }
    public void setTotalCollectedAmount(BigDecimal totalCollectedAmount) { 
        this.totalCollectedAmount = totalCollectedAmount; 
    }

    public BigDecimal getRemainingEmiAmount() { return remainingEmiAmount; }
    public void setRemainingEmiAmount(BigDecimal remainingEmiAmount) { 
        this.remainingEmiAmount = remainingEmiAmount; 
    }
}