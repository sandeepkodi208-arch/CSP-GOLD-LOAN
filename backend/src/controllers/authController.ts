import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { first_name, last_name, email, password, phone } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            phone,
            role: 'staff'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                role: newUser.role,
                token: generateToken(newUser._id.toString(), newUser.role),
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password as string);

        if (isMatch) {
            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id.toString(), user.role),
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not found in request' });
            return;
        }

        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        const userData = user.toObject();
        (userData as any).id = userData._id;

        res.json({
            success: true,
            message: 'User profile retrieved',
            data: userData
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
