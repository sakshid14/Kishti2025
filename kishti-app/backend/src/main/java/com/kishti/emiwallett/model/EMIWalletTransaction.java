package com.kishti.emiwallett.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "emi_wallet_transactions")
public class EMIWalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "transaction_amount", precision = 15, scale = 2)
    private BigDecimal transactionAmount;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "emi_collection_amount", precision = 15, scale = 2)
    private BigDecimal emiCollectionAmount;

    @Column(name = "payment_reference")
    private String paymentReference;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransactionType {
        PAYMENT_RECEIVED, EMI_COLLECTION, REFUND
    }

    // Constructors
    public EMIWalletTransaction() {}

    public EMIWalletTransaction(Loan loan, BigDecimal transactionAmount, 
                               BigDecimal emiCollectionAmount, String paymentReference,
                               String description, TransactionType transactionType) {
        this.loan = loan;
        this.transactionAmount = transactionAmount;
        this.emiCollectionAmount = emiCollectionAmount;
        this.paymentReference = paymentReference;
        this.description = description;
        this.transactionType = transactionType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Loan getLoan() { return loan; }
    public void setLoan(Loan loan) { this.loan = loan; }

    public BigDecimal getTransactionAmount() { return transactionAmount; }
    public void setTransactionAmount(BigDecimal transactionAmount) { this.transactionAmount = transactionAmount; }

    public BigDecimal getEmiCollectionAmount() { return emiCollectionAmount; }
    public void setEmiCollectionAmount(BigDecimal emiCollectionAmount) { 
        this.emiCollectionAmount = emiCollectionAmount; 
    }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(TransactionType transactionType) { this.transactionType = transactionType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}