import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Since this might be called before server.ts loads dotenv in some test flows, it's safe to config here
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

mongoose.plugin((schema) => {
    schema.set('toJSON', {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete (ret as any)._id;
            delete (ret as any).__v;
            return ret;
        }
    });
    schema.set('toObject', {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete (ret as any)._id;
            delete (ret as any).__v;
            return ret;
        }
    });
});

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/golden_gem_manager';
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error: any) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
