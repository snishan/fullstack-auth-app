import jwt from 'jsonwebtoken'; 
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY; 
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

export const generateAccessToken = (userId: number, role: string): string => {
    return jwt.sign(
        { userId, role },
        process.env.JWT_ACCESS_SECRET!,
        { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
    );
};
export const generateRefreshToken = (userId: number): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
    );
};

export const verifyAccessToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    } catch (error) {
        throw new Error('Invalid access token');
    }
};

export const verifyRefreshToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

export const generateResetToken = (userId: number): string => {
    return jwt.sign({ userId, type: 'reset' }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '1h', });
};

export const verifyResetToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    } catch (error) {
        throw new Error('Invalid reset token');
    }
};