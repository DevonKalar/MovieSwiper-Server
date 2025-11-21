import type { JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many login attempts, please try again later.'
});

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  
    // Check for token in Authorization header OR cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.auth_token;
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check for token in Authorization header OR cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.auth_token;
    
    if (!token) {
        // No token is fine, continue without setting req.user
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;
        req.user = decoded;
        next();
    } catch (err) {
        // Invalid token is also fine, continue without setting req.user
        next();
    }
};
