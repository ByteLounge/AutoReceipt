# Achiever's Academy - AutoReceipt 🎓

A professional Tuition Fee Management System and automated Receipt Generator designed for educational institutions. This application streamlines the process of managing student admissions, tracking installment-based fee payments, and generating high-quality PDF fee cards/receipts.

![Achiever's Academy Logo](public/logo.png)

## 🚀 Features

- **Student Management**: Easy-to-use interface for student admissions and record keeping.
- **Dynamic Fee Tracking**: 
  - Automated status tracking (Pending, Partial Paid, Fully Paid).
  - Grade-specific fee structures.
  - Calculation of pending balances based on joining installments.
- **Automated Receipt Generation**: 
  - Generates professional PDF fee cards with a custom watermark.
  - Individual student receipt downloads available from multiple views.
  - Auto-generation of receipts upon successful payment processing.
- **Admin Tools & Registers**:
  - Exportable Fee Registers (PDF) for all grades.
  - Filterable registers for specific standards (Grade 5 to 10).
  - Print-friendly table views.
- **WhatsApp Integration**: Direct one-click reminder and receipt sharing via WhatsApp.
- **Real-time Sync**: Powered by Firebase Firestore for instant updates across devices.
- **Secure Access**: Protected admin workspace with code-based authentication.

## 🛠️ Tech Stack

- **Frontend**: React (TypeScript)
- **Styling**: Vanilla CSS / Tailwind-like utilities via Lucide React
- **Icons**: Lucide React
- **Database**: Firebase Firestore
- **PDF Generation**: jsPDF & jsPDF-AutoTable
- **Build Tool**: Vite
- **Date Handling**: date-fns

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/AutoReceipt.git
   cd AutoReceipt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   Update the configuration in `src/firebase.ts` with your project credentials:
   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔒 Security Configuration

To ensure your database is accessible to the app, configure your Firestore Rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{studentId} {
      allow read, write: if true; // In production, restrict this to authenticated users
    }
  }
}
```

## 📝 License

This project is developed for Achiever's Academy. All rights reserved.

---
Built with ❤️ for better educational management.
