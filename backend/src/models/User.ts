import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    phone?: string;
    role: 'admin' | 'staff';
    created_at: Date;
    updated_at: Date;
}

const userSchema = new Schema<IUser>({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['admin', 'staff'], default: 'staff' },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model<IUser>('User', userSchema);
