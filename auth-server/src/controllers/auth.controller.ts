import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyRefreshToken,
  verifyResetToken,
} from '../utils/jwt';

const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password, role = 'USER' } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    res.status(201).json({
      message: 'Signup successful',
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to sign up' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user) {
      res.status(401).json({ error: 'Invalid username' });
      return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid password' });
      return 
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });
     res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: { email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};


export const logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token is required' });
      return;
    }
  
    try {
      verifyRefreshToken(refreshToken);
  
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });
  
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      res.json({
        message: 'Logout successful',
      });
  
    } catch (error) {
      console.error('Logout error:', error);
      res.status(400).json({ error: 'Invalid refresh token' });
    }
  };
  

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token is required' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: payload.userId, refreshToken },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    const accessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      message: 'Token refreshed',
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const resetToken = generateResetToken(user.id);
    // TODO: Store this token in DB or cache and send via email
    console.log(`Send this reset token via email: ${resetToken}`);

    res.json({ message: 'Password reset email sent (mocked)' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request password reset' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ error: 'Token and new password are required' });
    return;
  }

  try {
    const payload = verifyResetToken(token) as { userId: number; type: string };

    if (payload.type !== 'reset') {
      res.status(400).json({ error: 'Invalid reset token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to reset password' });
  }
};
