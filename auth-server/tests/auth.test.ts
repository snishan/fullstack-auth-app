import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { 
  signup, 
  login, 
  logout, 
  refresh, 
  requestPasswordReset, 
  resetPassword 
} from '../src/controllers/auth.controller'; // Adjust path as needed
import { 
  generateAccessToken, 
  generateRefreshToken, 
  generateResetToken, 
  verifyRefreshToken, 
  verifyResetToken 
} from '../src/utils/jwt';

// Mock dependencies
jest.mock('../src/config/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    }
  }
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation(() => Promise.resolve('hashed-password')),
  compare: jest.fn().mockImplementation(() => Promise.resolve(true))
}));

jest.mock('../src/utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  generateResetToken: jest.fn(() => 'mock-reset-token'),
  verifyRefreshToken: jest.fn(() => ({ userId: 1 })),
  verifyResetToken: jest.fn(() => ({ userId: 1, type: 'reset' }))
}));

// Import prisma after mocking
import { prisma } from '../src/config/prisma';

describe('Auth Service', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup response mock with common methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn()
    };

    // Default request body will be empty - specific tests will set it
    mockRequest = {
      body: {},
      cookies: {}
    };
  });

  //================================================
  // SIGNUP TESTS
  //================================================
  describe('signup', () => {
    test('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'password123' };
      
      await signup(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });
    
    test('should return 400 if password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };
      
      await signup(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });
    
    test('should return 400 if email already exists', async () => {
      mockRequest.body = { email: 'existing@example.com', password: 'password123' };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, email: 'existing@example.com' });
      
      await signup(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email already exists' });
    });
    
    test('should create a new user with hashed password and return 201', async () => {
      mockRequest.body = { 
        email: 'new@example.com', 
        password: 'password123',
        role: 'USER'
      };
      
      const mockUser = {
        id: 1,
        email: 'new@example.com',
        role: 'USER'
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      
      await signup(mockRequest as Request, mockResponse as Response);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', expect.any(Number));
      
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          password: 'hashed-password',
          role: 'USER'
        }
      });
      
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Signup successful',
        user: { email: 'new@example.com', role: 'USER' }
      });
    });
    
    test('should default to USER role if not specified', async () => {
      mockRequest.body = { 
        email: 'new@example.com', 
        password: 'password123'
        // role not specified
      };
      
      const mockUser = {
        id: 1,
        email: 'new@example.com',
        role: 'USER'
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
      
      await signup(mockRequest as Request, mockResponse as Response);
      
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'new@example.com',
          password: 'hashed-password',
          role: 'USER'
        }
      });
    });
    
    test('should return 500 if database operation fails', async () => {
      mockRequest.body = { 
        email: 'new@example.com', 
        password: 'password123'
      };
      
      // Silence console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await signup(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to sign up' });
      
      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  //================================================
  // LOGIN TESTS
  //================================================
  describe('login', () => {
    test('should return 400 if email is missing', async () => {
      mockRequest.body = { password: 'password123' };
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });
    
    test('should return 400 if password is missing', async () => {
      mockRequest.body = { email: 'test@example.com' };
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email and password are required' });
    });
    
    test('should return 401 if user is not found', async () => {
      mockRequest.body = { 
        email: 'nonexistent@example.com', 
        password: 'password123' 
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
    
    test('should return 401 if password is incorrect', async () => {
      mockRequest.body = { 
        email: 'test@example.com', 
        password: 'wrong-password' 
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'USER'
      });
      
      // Mock bcrypt.compare to return false for this test
      (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(false));
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
    
    test('should generate tokens and return user data on successful login', async () => {
      mockRequest.body = { 
        email: 'test@example.com', 
        password: 'correct-password' 
      };
      
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'USER'
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      // Reset the mock to return true for correct password
      (bcrypt.compare as jest.Mock).mockImplementation(() => Promise.resolve(true));
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(generateAccessToken).toHaveBeenCalledWith(1, 'USER');
      expect(generateRefreshToken).toHaveBeenCalledWith(1);
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { refreshToken: 'mock-refresh-token' }
      });
      
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'mock-refresh-token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000
        })
      );
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Login successful',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { email: 'test@example.com', role: 'USER' }
      });
    });
    
    test('should return 500 if database operation fails', async () => {
      mockRequest.body = { 
        email: 'test@example.com', 
        password: 'password123' 
      };
      
      // Silence console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await login(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to log in' });
      
      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  //================================================
  // LOGOUT TESTS
  //================================================
  describe('logout', () => {
    test('should return 400 if refresh token is missing', async () => {
      mockRequest.cookies = {}; // No refreshToken
      
      await logout(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Refresh token is required' });
    });
    
    test('should clear token from database and cookies on successful logout', async () => {
      mockRequest.cookies = { refreshToken: 'valid-refresh-token' };
      
      (prisma.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      
      await logout(mockRequest as Request, mockResponse as Response);
      
      expect(verifyRefreshToken).toHaveBeenCalledWith('valid-refresh-token');
      
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { refreshToken: 'valid-refresh-token' },
        data: { refreshToken: null }
      });
      
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict'
        })
      );
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logout successful'
      });
    });
    
    test('should return 400 if token verification fails', async () => {
      mockRequest.cookies = { refreshToken: 'invalid-refresh-token' };
      
      // Silence console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock verify function to throw error
      (verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await logout(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
      
      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  //================================================
  // REFRESH TOKEN TESTS
  //================================================
  describe('refresh', () => {
    test('should return 400 if refresh token is missing', async () => {
      mockRequest.body = {}; // No refreshToken
      
      await refresh(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Refresh token is required' });
    });
    
    test('should return 401 if user not found with token', async () => {
      mockRequest.body = { refreshToken: 'valid-refresh-token' };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      await refresh(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
    });
    
    
    test('should return 401 if token verification fails', async () => {
      mockRequest.body = { refreshToken: 'invalid-refresh-token' };
      
      // Mock verify function to throw error
      (verifyRefreshToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await refresh(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid refresh token' });
    });
  });

  //================================================
  // REQUEST PASSWORD RESET TESTS
  //================================================
  describe('requestPasswordReset', () => {
    test('should return 400 if email is missing', async () => {
      mockRequest.body = {}; // No email
      
      await requestPasswordReset(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Email is required' });
    });
    
    test('should return 404 if user not found', async () => {
      mockRequest.body = { email: 'nonexistent@example.com' };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      await requestPasswordReset(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
    
    test('should generate reset token for valid user', async () => {
      mockRequest.body = { email: 'test@example.com' };
      
      const mockUser = {
        id: 1,
        email: 'test@example.com'
      };
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await requestPasswordReset(mockRequest as Request, mockResponse as Response);
      
      expect(generateResetToken).toHaveBeenCalledWith(1);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('mock-reset-token'));
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password reset email sent (mocked)'
      });
      
      consoleSpy.mockRestore();
    });
    
    test('should return 500 if operation fails', async () => {
      mockRequest.body = { email: 'test@example.com' };
      
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await requestPasswordReset(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to request password reset' });
    });
  });

  //================================================
  // RESET PASSWORD TESTS
  //================================================
  describe('resetPassword', () => {
    test('should return 400 if token is missing', async () => {
      mockRequest.body = { password: 'newpassword123' }; // No token
      
      await resetPassword(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token and new password are required' });
    });
    
    test('should return 400 if password is missing', async () => {
      mockRequest.body = { token: 'valid-reset-token' }; // No password
      
      await resetPassword(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token and new password are required' });
    });
    
    test('should return 400 if token type is incorrect', async () => {
      mockRequest.body = { 
        token: 'invalid-type-token', 
        password: 'newpassword123' 
      };
      
      // Mock token verification to return wrong type
      (verifyResetToken as jest.Mock).mockReturnValue({ 
        userId: 1, 
        type: 'not-reset' 
      });
      
      await resetPassword(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid reset token' });
    });
    
    test('should update password for valid token', async () => {
      mockRequest.body = { 
        token: 'valid-reset-token', 
        password: 'newpassword123' 
      };
      
      // Reset the mock to return correct type
      (verifyResetToken as jest.Mock).mockReturnValue({ 
        userId: 1, 
        type: 'reset' 
      });
      
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com'
      });
      
      await resetPassword(mockRequest as Request, mockResponse as Response);
      
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', expect.any(Number));
      
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'hashed-password' }
      });
      
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Password reset successful'
      });
    });
    
    test('should return 400 if token verification fails', async () => {
      mockRequest.body = { 
        token: 'invalid-reset-token', 
        password: 'newpassword123' 
      };
      
      // Mock verify function to throw error
      (verifyResetToken as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      await resetPassword(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to reset password' });
    });
  });
});