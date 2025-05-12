import { Router, Request, Response, RequestHandler, NextFunction } from 'express';
import {
    signup,
    login,
    logout,
    refresh,
    requestPasswordReset,
    resetPassword,
} from '../controllers/auth.controller';
import {
    authenticate,
    restrictTo
} from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.post('/reset-password', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);

// Example protected route 
router.get('/admin', authenticate, restrictTo('ADMIN'), (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: 'Welcome, Admin!' });
});

export default router;