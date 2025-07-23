package com.kishti.emiwallett.repository;

import com.kishti.emiwallett.model.EMIPayment;
import com.kishti.emiwallett.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EMIPaymentRepository extends JpaRepository<EMIPayment, Long> {
    
    List<EMIPayment> findByLoan(Loan loan);
    
    List<EMIPayment> findByLoanOrderByDueDateDesc(Loan loan);
    
    List<EMIPayment> findByStatus(EMIPayment.PaymentStatus status);
    
    List<EMIPayment> findByDueDateAndStatus(LocalDate dueDate, EMIPayment.PaymentStatus status);
    
    @Query("SELECT p FROM EMIPayment p WHERE p.dueDate < :currentDate AND p.status = 'PENDING'")
    List<EMIPayment> findOverduePayments(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT SUM(p.paymentAmount) FROM EMIPayment p WHERE p.loan = :loan AND p.status = 'COMPLETED'")
    BigDecimal getTotalPaidAmountByLoan(@Param("loan") Loan loan);
    
    @Query("SELECT p FROM EMIPayment p WHERE p.loan.borrower.id = :borrowerId ORDER BY p.dueDate DESC")
    List<EMIPayment> findByBorrowerIdOrderByDueDateDesc(@Param("borrowerId") Long borrowerId);
    
    @Query("SELECT p FROM EMIPayment p WHERE p.loan.lender.id = :lenderId ORDER BY p.dueDate DESC")
    List<EMIPayment> findByLenderIdOrderByDueDateDesc(@Param("lenderId") Long lenderId);
    
    @Query("SELECT COUNT(p) FROM EMIPayment p WHERE p.loan.lender.id = :lenderId AND p.status = 'COMPLETED' " +
           "AND p.paymentDate >= :startDate AND p.paymentDate <= :endDate")
    Long getCompletedPaymentsCountByLenderAndDateRange(@Param("lenderId") Long lenderId,
                                                      @Param("startDate") LocalDate startDate,
                                                      @Param("endDate") LocalDate endDate);
}