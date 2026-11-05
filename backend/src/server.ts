import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Import Routes
import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import loanRoutes from './routes/loanRoutes';
import paymentRoutes, { loanPaymentRouter } from './routes/paymentRoutes';
import goldRateRoutes from './routes/goldRateRoutes';
import appraisalRoutes from './routes/appraisalRoutes';
import reportRoutes from './routes/reportRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';
import connectDB from './config/db';
import mongoose from 'mongoose';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', async (req: Request, res: Response) => {
    try {
        // Quick DB check
        const state = mongoose.connection.readyState;
        if (state !== 1) {
            throw new Error('Database not connected');
        }
        res.json({
            success: true,
            message: 'Golden Gem Manager API is running and connected to DB'
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'API is running but DB connection failed: ' + error.message
        });
    }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/gold-rates', goldRateRoutes);
app.use('/api/appraisals', appraisalRoutes);
app.use('/api/reports', reportRoutes);

// Support for /api/loans/:loanId/payments
app.use('/api/loans/:loanId/payments', loanPaymentRouter);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
});
