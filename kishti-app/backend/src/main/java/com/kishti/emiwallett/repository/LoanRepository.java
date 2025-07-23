package com.kishti.emiwallett.repository;

import com.kishti.emiwallett.model.Loan;
import com.kishti.emiwallett.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    
    List<Loan> findByBorrower(User borrower);
    
    List<Loan> findByLender(User lender);
    
    List<Loan> findByStatus(Loan.LoanStatus status);
    
    List<Loan> findByBorrowerAndStatus(User borrower, Loan.LoanStatus status);
    
    List<Loan> findByLenderAndStatus(User lender, Loan.LoanStatus status);
    
    @Query("SELECT l FROM Loan l WHERE l.emiDayOfMonth = :dayOfMonth AND l.status = 'ACTIVE'")
    List<Loan> findLoansWithEmiDueToday(@Param("dayOfMonth") Integer dayOfMonth);
    
    @Query("SELECT SUM(l.outstandingAmount) FROM Loan l WHERE l.borrower = :borrower AND l.status = 'ACTIVE'")
    BigDecimal getTotalOutstandingAmountByBorrower(@Param("borrower") User borrower);
    
    @Query("SELECT SUM(l.emiAmount) FROM Loan l WHERE l.borrower = :borrower AND l.status = 'ACTIVE'")
    BigDecimal getTotalMonthlyEMIByBorrower(@Param("borrower") User borrower);
    
    @Query("SELECT SUM(l.principalAmount) FROM Loan l WHERE l.lender = :lender")
    BigDecimal getTotalLoanAmountByLender(@Param("lender") User lender);
    
    @Query("SELECT SUM(l.outstandingAmount) FROM Loan l WHERE l.lender = :lender AND l.status = 'ACTIVE'")
    BigDecimal getTotalOutstandingAmountByLender(@Param("lender") User lender);
    
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.lender = :lender")
    Long getActiveBorrowersCountByLender(@Param("lender") User lender);
}