# 🔐 Fullstack Authentication & Authorization App

A **comprehensive full-stack authentication and authorization system** built with modern web technologies. This project showcases secure user management with **JWT-based authentication**, **role-based access control**, and thorough **testing coverage**.

![Auth System](https://img.shields.io/badge/Auth%20System-Secure-brightgreen)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Express-green)
![Database](https://img.shields.io/badge/Database-Prisma-orange)
![Testing](https://img.shields.io/badge/Testing-Jest-red)

## ✨ Features

### Authentication
- 📝 User registration with email verification
- 🔑 Secure login with JWT (access & refresh tokens)
- 🔄 Automatic token refreshing
- 🔒 Password reset functionality
- 📤 Logout mechanism

### Authorization
- 👑 Role-based access control (`USER`, `ADMIN`, etc.)
- 🛡️ Protected API routes
- 🔍 Permission-based action control

### Security
- 🔐 Password hashing with bcrypt
- ⏱️ Short-lived access tokens
- 🔄 Secure refresh token rotation
- 🛑 XSS & CSRF protection
- 🧪 Comprehensive test suite

## 🧩 Project Structure

```
fullstack-auth-app/
│
├── auth-server/                  # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/          # Route controllers
│   │   ├── middleware/           # Auth & validation middleware
│   │   ├── routes/               # API routes
│   │   ├── utils/                # Helper functions
│   │   └── config/               # Environment configuration
│   ├── tests/                    # Jest unit and integration tests
│   ├── prisma/                   # Prisma schema & migrations
│   └── package.json
│
├── auth-client/                  # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route components
│   │   ├── hooks/                # Custom React hooks
│   │   └── services/             # API service functions
│   └── package.json
│
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **React Router** for navigation
- **Axios** for API requests
- **Context API** with custom hooks for auth state
- **CSS Modules** for styling

### Backend
- **Node.js** with Express
- **Prisma ORM** with PostgreSQL/SQLite
- **JWT** for authentication
- **Bcrypt** for password security
- **Jest** for testing

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.x
- npm or yarn
- PostgreSQL or SQLite (for Prisma)

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd auth-server
   npm install
   ```

2. Create a `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/authdb
   JWT_SECRET=your_jwt_secret
   REFRESH_SECRET=your_refresh_secret
   RESET_SECRET=your_reset_secret
   PORT=5000
   ```

3. Initialize Prisma:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd auth-client
   npm install
   ```

2. Create a `.env` file:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. Run the application:
   ```bash
   npm run dev
   ```

## ✅ Testing

We use Jest for comprehensive backend testing:

```bash
cd auth-server
npm run test
```

Our tests cover:
- User registration and authentication
- Token validation and refresh
- Password reset flow
- Role-based permissions
- Error handling and edge cases

## 🔒 Security Best Practices

- ✅ Password hashing with bcrypt and proper salt rounds
- ✅ Short-lived access tokens with refresh token rotation
- ✅ Secure HTTP-only cookies for token storage
- ✅ Input validation and sanitization
- ✅ CORS configuration to prevent unauthorized access
- ✅ Rate limiting to prevent brute force attacks
- ✅ Environment-based secrets management

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and receive tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate tokens
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Set new password

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users` - List all users (Admin only)
- `GET /api/users/:id` - Get specific user (Admin only)
- `PUT /api/users/:id/role` - Update user role (Admin only)

## 🙌 Author

Built with ❤️ by Sandun Thilakarathna

Feel free to fork, modify, or use this project to learn or bootstrap your own fullstack applications.
