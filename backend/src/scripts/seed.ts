import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Customer from '../models/Customer';
import Appraisal from '../models/Appraisal';
import Loan from '../models/Loan';
import Payment from '../models/Payment';
import GoldRate from '../models/GoldRate';
import User from '../models/User';
import * as bcrypt from 'bcryptjs';

dotenv.config();

const DEMO_CUSTOMERS = [
    { code: "CUST0001", fullName: "Ramesh Iyer", mobile: "9845012345", aadhaar: "4521 8899 1023", email: "ramesh.iyer@gmail.com", address: "12, Gandhi Street, T Nagar, Chennai", dob: "1979-04-12", occupation: "Textile Trader", status: "Active" },
    { code: "CUST0002", fullName: "Lakshmi Narayanan", mobile: "9900123456", aadhaar: "7788 4512 9087", email: "lakshmi.n@yahoo.in", address: "45/2, Bazaar Road, Madurai", dob: "1985-11-03", occupation: "School Teacher", status: "Active" },
    { code: "CUST0003", fullName: "Suresh Kumar", mobile: "9812345670", aadhaar: "1290 5566 3344", email: "suresh.kumar@outlook.com", address: "8, Anna Nagar West, Coimbatore", dob: "1972-01-25", occupation: "Farmer", status: "Active" },
    { code: "CUST0004", fullName: "Anita Deshmukh", mobile: "9765432109", aadhaar: "3344 7788 1122", email: "anita.d@gmail.com", address: "301, Shivaji Colony, Pune", dob: "1990-07-19", occupation: "Boutique Owner", status: "Active" },
    { code: "CUST0005", fullName: "Mohammed Farhan", mobile: "9701122334", aadhaar: "9911 2233 4455", email: "farhan.m@gmail.com", address: "22, Charminar Road, Hyderabad", dob: "1988-09-05", occupation: "Auto Dealer", status: "Inactive" },
    { code: "CUST0006", fullName: "Priya Venkatesh", mobile: "9600088776", aadhaar: "5566 1122 8899", email: "priya.v@gmail.com", address: "7, Lake View Street, Bengaluru", dob: "1993-02-27", occupation: "Software Engineer", status: "Active" },
];

const DEMO_LOANS = [
    { customerIdx: 0, ornament: "Gold Necklace", purity: "22K", weight: 42, amount: 200000, rate: 12, tenure: 12, monthsAgo: 4, paidEmis: 4, status: "Active" },
    { customerIdx: 1, ornament: "Bangles (4 pcs)", purity: "22K", weight: 28, amount: 140000, rate: 11.5, tenure: 18, monthsAgo: 6, paidEmis: 6, status: "Active" },
    { customerIdx: 2, ornament: "Gold Chain", purity: "24K", weight: 18, amount: 95000, rate: 13, tenure: 12, monthsAgo: 5, paidEmis: 2, status: "Overdue" },
    { customerIdx: 3, ornament: "Ear Studs & Ring", purity: "18K", weight: 15, amount: 55000, rate: 12.5, tenure: 9, monthsAgo: 9, paidEmis: 9, status: "Closed" },
    { customerIdx: 5, ornament: "Temple Jewellery Set", purity: "22K", weight: 65, amount: 320000, rate: 11, tenure: 24, monthsAgo: 2, paidEmis: 2, status: "Active" },
    { customerIdx: 4, ornament: "Gold Coins (5)", purity: "24K", weight: 50, amount: 260000, rate: 12, tenure: 12, monthsAgo: 7, paidEmis: 3, status: "Overdue" },
];

const MODES = ["Cash", "UPI", "Bank Transfer", "Card"];

export function addMonths(dateISO: string, months: number): string {
    const d = new Date(dateISO);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
}

export function goldValue(weightGrams: number, rate24k: number, purity: string): number {
    const factors: Record<string, number> = { "18K": 0.75, "20K": 0.833, "22K": 0.916, "24K": 1.0 };
    return Math.round(weightGrams * rate24k * factors[purity]);
}

export function loanMath(amount: number, rate: number, tenure: number) {
    const monthlyRate = rate / 12 / 100;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    const totalPayable = emi * tenure;
    return { emi: Math.round(emi), totalInterest: Math.round(totalPayable - amount), totalPayable: Math.round(totalPayable) };
}

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/golden_gem_manager';
        await mongoose.connect(uri);
        console.log('MongoDB Connected to', uri);
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const importData = async () => {
    await connectDB();
    try {
        await mongoose.connection.db?.dropDatabase();
        console.log('Database dropped to clear legacy indexes.');

        await User.deleteMany();
        await Customer.deleteMany();
        await Appraisal.deleteMany();
        await Loan.deleteMany();
        await Payment.deleteMany();
        await GoldRate.deleteMany();
        console.log('Data Cleared!');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('admin123', salt);
        await User.create({
            first_name: "Admin",
            last_name: "User",
            email: "admin", // using email field as username since that's what frontend uses
            password: passwordHash,
            role: "admin"
        });

        const rateSettings = await GoldRate.create({ rate24k: 7420, updatedAt: new Date().toISOString() });

        const insertedCustomers = await Customer.insertMany(DEMO_CUSTOMERS);

        const LTV = 0.75;
        const now = new Date();

        let paymentCount = 100;
        for (let i = 0; i < DEMO_LOANS.length; i++) {
            const d = DEMO_LOANS[i];
            const customer = insertedCustomers[d.customerIdx];
            const value = goldValue(d.weight, rateSettings.rate24k, d.purity);
            const start = new Date(now.getFullYear(), now.getMonth() - d.monthsAgo, 10).toISOString().slice(0, 10);
            const math = loanMath(d.amount, d.rate, d.tenure);

            const appraisal = await Appraisal.create({
                code: `APR${String(i + 1).padStart(4, "0")}`,
                customerId: customer._id.toString(),
                ornamentName: d.ornament,
                purity: d.purity,
                weightGrams: d.weight,
                goldRate: rateSettings.rate24k,
                estimatedValue: value,
                createdAt: start,
            });

            let outstanding = math.totalPayable;
            if (d.status === "Closed") outstanding = 0;
            else {
                for (let p = 0; p < d.paidEmis; p++) {
                    outstanding = Math.max(0, outstanding - math.emi);
                }
            }

            const loan = await Loan.create({
                code: `LN${String(i + 1).padStart(4, "0")}`,
                customerId: customer._id.toString(),
                appraisalId: appraisal._id.toString(),
                eligibleAmount: Math.round(value * LTV),
                loanAmount: d.amount,
                interestRate: d.rate,
                tenureMonths: d.tenure,
                processingFee: Math.round(d.amount * 0.01),
                emi: math.emi,
                totalInterest: math.totalInterest,
                totalPayable: math.totalPayable,
                outstanding,
                status: d.status as any,
                startDate: start,
                nextDueDate: addMonths(start, d.paidEmis + 1),
            });

            appraisal.loanId = (loan as any)._id.toString();
            await appraisal.save();

            let outCache = math.totalPayable;
            for (let p = 0; p < d.paidEmis; p++) {
                outCache = Math.max(0, outCache - math.emi);
                await Payment.create({
                    code: `PMT${String(paymentCount++).padStart(4, "0")}`,
                    loanId: (loan as any)._id.toString(),
                    customerId: (customer as any)._id.toString(),
                    date: addMonths(start, p + 1),
                    amount: math.emi,
                    mode: MODES[(i + p) % MODES.length] as any,
                    transactionId: `TXN${100000 + i * 17 + p}`,
                });
            }
        }

        console.log('Data Imported!');
        process.exit();
    } catch (error: any) {
        console.error('Error with import', error.message);
        process.exit(1);
    }
};

importData();
