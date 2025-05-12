# Fullstack Authentication & Authorization App

This project demonstrates a **secure, full-stack authentication and authorization system** built with **React** for the frontend and **Node.js (Express)** for the backend. It follows modern best practices and includes full **JWT-based authentication**, **role-based access control**, and **Jest testing** for critical backend functionalities.

---

## 🧩 Project Structure

fullstack-auth-app/
│
├── auth-server/ # Backend (Node.js + Express + Prisma)
│ ├── src/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── routes/
│ │ ├── utils/
│ │ └── config/
│ ├── tests/ # Jest unit and integration tests
│ ├── prisma/ # Prisma schema & migrations
│ └── package.json
│
├── auth-client/ # Frontend (React + TypeScript)
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── hooks/
│ │ └── services/
│ └── package.json
│
└── README.md


---

## ✨ Features

### 🔐 Authentication

- Sign Up / Log In / Log Out
- Password hashing with **bcrypt**
- JWT-based **access and refresh tokens**
- Secure token storage & refreshing
- Password reset with secure tokens

### 👮 Authorization

- Role-based access control (`USER`, `ADMIN`, etc.)
- Protected API endpoints
- Middleware-driven validation

### ⚙️ Tech Stack

**Frontend:**
- React (with TypeScript)
- React Router
- Axios for HTTP requests
- Context API + Custom Hooks for auth state

**Backend:**
- Node.js with Express
- Prisma ORM with PostgreSQL or SQLite
- JWT for tokens
- Bcrypt for password hashing
- Jest for unit testing

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm / yarn
- PostgreSQL / SQLite (for Prisma)

---

## 🛠️ Backend Setup

```bash
cd auth-server
npm install

Beckend Setup
Create .env file
DATABASE_URL=postgresql://user:password@localhost:5432/authdb
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
RESET_SECRET=your_reset_secret

Prisma Setup
npx prisma migrate dev --name init
npx prisma generate

Run the Server
npm run dev


🎨 Frontend Setup
cd auth-client
npm install

Environment File
Create a .env file with:

VITE_API_BASE_URL=http://localhost:5000/api

Run the Client
npm run dev

✅ Testing
We use Jest for backend testing.

cd auth-server
npm run test


Tests cover:

User signup & login

Password reset flow

Token validation

Error handling & edge cases

Security Practices Followed
Hashed passwords using bcrypt

JWT with short-lived access and long-lived refresh tokens

Token verification with role checks

Environment-based secret management

Input validation and error handling

🙌 Author
Built with ❤️ by Sandun Thilakarathna

Feel free to fork, modify, or use this project to learn or bootstrap your own fullstack applications.
