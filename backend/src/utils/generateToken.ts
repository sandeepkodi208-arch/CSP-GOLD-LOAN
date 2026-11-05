import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const generateToken = (id: string, role: string) => {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign({ id, role }, secret, {
        expiresIn: '30d',
    });
};

export default generateToken;
