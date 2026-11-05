import mongoose, { Document, Schema } from 'mongoose';

export interface IGoldRate extends Document {
    rate24k: number;
    updatedAt: string;
    createdAt: Date;
}

const goldRateSchema = new Schema<IGoldRate>({
    rate24k: { type: Number, required: true },
    updatedAt: { type: String, required: true },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<IGoldRate>('GoldRate', goldRateSchema);
