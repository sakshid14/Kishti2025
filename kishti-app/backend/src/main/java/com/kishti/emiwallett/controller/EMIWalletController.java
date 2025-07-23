package com.kishti.emiwallett.controller;

import com.kishti.emiwallett.dto.DashboardDTO;
import com.kishti.emiwallett.dto.LoanDTO;
import com.kishti.emiwallett.service.EMIWalletService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emi-wallet")
@CrossOrigin(origins = "*")
public class EMIWalletController {

    @Autowired
    private EMIWalletService emiWalletService;

    @PostMapping("/loans")
    public ResponseEntity<LoanDTO> createLoan(@Valid @RequestBody LoanDTO loanDTO) {
        try {
            LoanDTO createdLoan = emiWalletService.createLoan(loanDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLoan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/payments")
    public ResponseEntity<Map<String, String>> processPayment(@RequestBody Map<String, Object> paymentRequest) {
        try {
            Long loanId = Long.valueOf(paymentRequest.get("loanId").toString());
            BigDecimal paymentAmount = new BigDecimal(paymentRequest.get("paymentAmount").toString());
            String paymentReference = (String) paymentRequest.get("paymentReference");

            emiWalletService.processPayment(loanId, paymentAmount, paymentReference);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Payment processed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/loans/borrower/{borrowerId}")
    public ResponseEntity<List<LoanDTO>> getLoansByBorrower(@PathVariable Long borrowerId) {
        try {
            List<LoanDTO> loans = emiWalletService.getLoansByBorrower(borrowerId);
            return ResponseEntity.ok(loans);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/loans/lender/{lenderId}")
    public ResponseEntity<List<LoanDTO>> getLoansByLender(@PathVariable Long lenderId) {
        try {
            List<LoanDTO> loans = emiWalletService.getLoansByLender(lenderId);
            return ResponseEntity.ok(loans);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/loans/{loanId}/collected-amount")
    public ResponseEntity<Map<String, Object>> getTotalCollectedAmount(@PathVariable Long loanId) {
        try {
            BigDecimal totalCollected = emiWalletService.getTotalCollectedAmount(loanId);
            BigDecimal thisMonthCollected = emiWalletService.getCollectedAmountThisMonth(loanId);
            
            return ResponseEntity.ok(Map.of(
                "totalCollected", totalCollected,
                "thisMonthCollected", thisMonthCollected
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/dashboard/borrower/{borrowerId}")
    public ResponseEntity<DashboardDTO.BorrowerDashboard> getBorrowerDashboard(@PathVariable Long borrowerId) {
        try {
            DashboardDTO.BorrowerDashboard dashboard = emiWalletService.getBorrowerDashboard(borrowerId);
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/dashboard/lender/{lenderId}")
    public ResponseEntity<DashboardDTO.LenderDashboard> getLenderDashboard(@PathVariable Long lenderId) {
        try {
            DashboardDTO.LenderDashboard dashboard = emiWalletService.getLenderDashboard(lenderId);
            return ResponseEntity.ok(dashboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/trigger-emi-payments")
    public ResponseEntity<Map<String, String>> triggerEMIPayments() {
        try {
            emiWalletService.processScheduledEMIPayments();
            return ResponseEntity.ok(Map.of("status", "success", "message", "EMI payments processed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}