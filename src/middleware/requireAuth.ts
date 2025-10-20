import type { JwtPayload } from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, process.env.JWT_SECRET || '', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = decoded as JwtPayload;
        next();
    });
};

export default requireAuth;
