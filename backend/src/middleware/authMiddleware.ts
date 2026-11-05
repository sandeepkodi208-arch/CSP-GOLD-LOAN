import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        first_name: string;
        last_name: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;

            const user = await User.findById(decoded.id).select('first_name last_name email role');

            if (!user) {
                res.status(401).json({ success: false, message: 'Not authorized, user not found' });
                return;
            }

            req.user = {
                id: (user._id as any).toString(),
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name
            };
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized as an admin' });
    }
};
