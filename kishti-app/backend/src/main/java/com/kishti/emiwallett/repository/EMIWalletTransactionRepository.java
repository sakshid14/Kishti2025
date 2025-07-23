package com.kishti.emiwallett.repository;

import com.kishti.emiwallett.model.EMIWalletTransaction;
import com.kishti.emiwallett.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EMIWalletTransactionRepository extends JpaRepository<EMIWalletTransaction, Long> {
    
    List<EMIWalletTransaction> findByLoan(Loan loan);
    
    List<EMIWalletTransaction> findByLoanOrderByCreatedAtDesc(Loan loan);
    
    @Query("SELECT SUM(t.emiCollectionAmount) FROM EMIWalletTransaction t WHERE t.loan = :loan")
    BigDecimal getTotalCollectedAmountByLoan(@Param("loan") Loan loan);
    
    @Query("SELECT SUM(t.emiCollectionAmount) FROM EMIWalletTransaction t WHERE t.loan = :loan " +
           "AND t.createdAt >= :startDate AND t.createdAt <= :endDate")
    BigDecimal getCollectedAmountByLoanAndDateRange(@Param("loan") Loan loan,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM EMIWalletTransaction t WHERE t.loan.borrower.id = :borrowerId " +
           "ORDER BY t.createdAt DESC")
    List<EMIWalletTransaction> findByBorrowerIdOrderByCreatedAtDesc(@Param("borrowerId") Long borrowerId);
    
    @Query("SELECT t FROM EMIWalletTransaction t WHERE t.loan.lender.id = :lenderId " +
           "ORDER BY t.createdAt DESC")
    List<EMIWalletTransaction> findByLenderIdOrderByCreatedAtDesc(@Param("lenderId") Long lenderId);
}