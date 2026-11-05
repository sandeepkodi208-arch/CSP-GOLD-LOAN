import mongoose from 'mongoose';
import connectDB from '../config/db';
import Customer from '../models/Customer';

const customers = [
    {
        code: "CUST-1001",
        fullName: "Rahul Sharma",
        mobile: "9876543210",
        aadhaar: "123456789012",
        email: "rahul.sharma@example.com",
        address: "123 MG Road, Bangalore",
        dob: "1985-10-12",
        occupation: "Software Engineer",
        status: "Active"
    },
    {
        code: "CUST-1002",
        fullName: "Priya Patel",
        mobile: "9123456789",
        aadhaar: "234567890123",
        email: "priya.patel@example.com",
        address: "456 Park Street, Mumbai",
        dob: "1990-05-24",
        occupation: "Teacher",
        status: "Active"
    },
    {
        code: "CUST-1003",
        fullName: "Amit Kumar",
        mobile: "9988776655",
        aadhaar: "345678901234",
        email: "amit.kumar@example.com",
        address: "789 Sector 17, Chandigarh",
        dob: "1982-11-03",
        occupation: "Business Owner",
        status: "Active"
    }
];

const addCustomers = async () => {
    try {
        await connectDB();
        
        for (const customer of customers) {
            const existing = await Customer.findOne({ code: customer.code });
            if (!existing) {
                await Customer.create(customer);
                console.log(`Added customer: ${customer.fullName}`);
            } else {
                console.log(`Customer ${customer.fullName} already exists.`);
            }
        }
        
        console.log("Customer import complete.");
        process.exit(0);
    } catch (error) {
        console.error("Error adding customers:", error);
        process.exit(1);
    }
};

addCustomers();
