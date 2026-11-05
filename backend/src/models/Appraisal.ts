import mongoose, { Document, Schema } from 'mongoose';

export interface IAppraisal extends Document {
    code: string;
    customerId: string;
    ornamentName: string;
    purity: string;
    weightGrams: number;
    goldRate: number;
    estimatedValue: number;
    createdAt: Date;
    loanId?: string;
}

const appraisalSchema = new Schema<IAppraisal>({
    code: { type: String, required: true, unique: true },
    customerId: { type: String, required: true },
    ornamentName: { type: String, required: true },
    purity: { type: String, required: true },
    weightGrams: { type: Number, required: true },
    goldRate: { type: Number, required: true },
    estimatedValue: { type: Number, required: true },
    loanId: { type: String },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IAppraisal>('Appraisal', appraisalSchema);
