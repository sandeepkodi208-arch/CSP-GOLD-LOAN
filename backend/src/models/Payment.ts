import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
    code: string;
    loanId: string;
    customerId: string;
    date: string;
    amount: number;
    mode: "Cash" | "UPI" | "Bank Transfer" | "Card";
    transactionId: string;
    createdAt: Date;
}

const paymentSchema = new Schema<IPayment>({
    code: { type: String, required: true, unique: true },
    loanId: { type: String, required: true },
    customerId: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    mode: { type: String, enum: ["Cash", "UPI", "Bank Transfer", "Card"], required: true },
    transactionId: { type: String, required: true },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IPayment>('Payment', paymentSchema);
