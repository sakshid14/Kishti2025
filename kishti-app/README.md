# Kishti EMI Wallet

A comprehensive EMI wallet system for MSMEs (Micro, Small & Medium Enterprises) that automatically collects and manages EMI payments from business transactions.

## Overview

Kishti EMI Wallet is designed to solve the EMI management problem for small businesses by:
- Automatically collecting a percentage of each transaction as EMI amount
- Managing multiple loans and lenders from a single dashboard
- Automating EMI payments to lenders on due dates
- Providing detailed analytics and reporting for both borrowers and lenders

## Features

### For Borrowers (MSMEs)
- **Automated EMI Collection**: Set percentage-based collection from each business transaction
- **Multi-Loan Management**: Handle multiple loans from different lenders
- **Real-time Dashboard**: View collected amounts, remaining EMI, and payment schedules
- **Transaction Management**: Add business transactions and automatically calculate EMI contributions
- **Payment Tracking**: Monitor EMI collection progress and upcoming payments

### For Lenders
- **Borrower Portfolio**: Overview of all loans given to different borrowers
- **Collection Analytics**: Track EMI collections and payment trends
- **Risk Assessment**: Monitor borrower payment behavior and wallet balances
- **Automated Payments**: Receive EMI payments automatically on due dates
- **Detailed Reporting**: Access comprehensive payment history and analytics

## Technology Stack

### Backend
- **Java 17** with **Spring Boot 3.x**
- **Spring Data JPA** for database operations
- **Spring Security** for authentication and authorization
- **H2 Database** for development (easily configurable for PostgreSQL/MySQL)
- **Maven** for dependency management

### Frontend
- **React 18** with **TypeScript**
- **Material-UI (MUI)** for modern, responsive UI components
- **React Router** for navigation
- **Recharts** for data visualization and analytics
- **Axios** for API communication

## Project Structure

```
kishti-app/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/kishti/emiwallett/
│   │   ├── config/            # Security and application configuration
│   │   ├── controller/        # REST API controllers
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Data access layer
│   │   └── service/          # Business logic layer
│   └── src/main/resources/
│       └── application.properties
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- **Java 17** or higher
- **Node.js 16** or higher
- **npm** or **yarn**

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd kishti-app/backend
   ```

2. Build and run the Spring Boot application:
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

3. The backend will start on `http://localhost:8080`

4. Access H2 database console at `http://localhost:8080/h2-console`
   - URL: `jdbc:h2:mem:kishti_db`
   - Username: `sa`
   - Password: `password`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd kishti-app/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. The frontend will start on `http://localhost:3000`

## API Endpoints

### User Management
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Loan Management
- `POST /api/emi-wallet/loans` - Create new loan
- `GET /api/emi-wallet/loans/borrower/{id}` - Get loans by borrower
- `GET /api/emi-wallet/loans/lender/{id}` - Get loans by lender
- `PUT /api/emi-wallet/loans/{id}/status` - Update loan status

### Transaction Management
- `POST /api/emi-wallet/transactions` - Add new transaction
- `GET /api/emi-wallet/transactions/loan/{id}` - Get transactions by loan
- `GET /api/emi-wallet/loans/{id}/wallet-balance` - Get loan wallet balance

### Dashboard & Analytics
- `GET /api/emi-wallet/dashboard/borrower/{id}` - Borrower dashboard data
- `GET /api/emi-wallet/dashboard/lender/{id}` - Lender dashboard data
- `GET /api/emi-wallet/payments/pending` - Get pending EMI payments

## Key Features Explained

### EMI Collection Mechanism
1. **Percentage-based Collection**: Each loan has a configurable collection percentage (e.g., 5% of each transaction)
2. **Automatic Calculation**: When a borrower adds a transaction, the system automatically calculates and sets aside the EMI amount
3. **Wallet System**: Collected amounts are stored in individual loan wallets until EMI due date

### Multi-Lender Support
- Borrowers can have loans from multiple lenders
- Each loan can have different collection percentages
- Consolidated dashboard shows total EMI obligations
- Automatic distribution of payments to different lenders

### Automated EMI Processing
- Scheduled service runs daily to check for due EMI payments
- Automatically transfers collected amounts to lenders on due dates
- Handles insufficient balance scenarios with appropriate notifications

### Real-time Analytics
- **Borrower Analytics**: Collection progress, remaining amounts, payment schedules
- **Lender Analytics**: Portfolio performance, collection rates, borrower behavior
- **Visual Charts**: Trends, comparisons, and progress indicators

## Demo Data

The application includes demo data for testing:
- 4 demo users (2 borrowers, 2 lenders)
- Sample loans with different terms and collection percentages
- Mock transactions and payment history

## Security Features

- Password encryption using BCrypt
- Role-based access control (Borrower/Lender)
- API authentication and authorization
- Input validation and sanitization

## Future Enhancements

1. **Payment Gateway Integration**: Direct bank transfers for EMI payments
2. **Mobile App**: React Native mobile application
3. **Advanced Analytics**: ML-based risk assessment and predictions
4. **Notification System**: SMS/Email alerts for due payments
5. **Multi-currency Support**: Support for different currencies
6. **Audit Trail**: Comprehensive logging and audit functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.