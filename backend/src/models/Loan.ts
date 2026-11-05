import mongoose, { Document, Schema } from 'mongoose';

export interface ILoan extends Document {
    code: string;
    customerId: string;
    appraisalId: string;
    eligibleAmount: number;
    loanAmount: number;
    interestRate: number;
    tenureMonths: number;
    processingFee: number;
    emi: number;
    totalInterest: number;
    totalPayable: number;
    outstanding: number;
    status: "Active" | "Closed" | "Overdue";
    startDate: string;
    nextDueDate: string;
    createdAt: Date;
}

const loanSchema = new Schema<ILoan>({
    code: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    appraisalId: { type: String, required: true },
    eligibleAmount: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    processingFee: { type: Number, required: true },
    emi: { type: Number, required: true },
    totalInterest: { type: Number, required: true },
    totalPayable: { type: Number, required: true },
    outstanding: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Closed', 'Overdue'], default: 'Active' },
    startDate: { type: String, required: true },
    nextDueDate: { type: String, required: true },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<ILoan>('Loan', loanSchema);
