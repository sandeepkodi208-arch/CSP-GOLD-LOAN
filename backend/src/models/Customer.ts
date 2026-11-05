import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
    code: string;
    fullName: string;
    mobile: string;
    aadhaar: string;
    email: string;
    address: string;
    dob: string;
    occupation: string;
    status: "Active" | "Inactive";
    createdAt: Date;
}

const customerSchema = new Schema<ICustomer>({
    code: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    aadhaar: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    dob: { type: String, default: "" },
    occupation: { type: String, default: "" },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

export default mongoose.model<ICustomer>('Customer', customerSchema);
