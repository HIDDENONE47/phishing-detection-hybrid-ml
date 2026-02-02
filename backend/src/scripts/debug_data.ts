
import mongoose from 'mongoose';
import ScanHistory from '../models/ScanHistory';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const runDebug = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/phishing-detection';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // 1. Check if there are ANY scans
        const count = await ScanHistory.countDocuments();
        console.log(`Total scans in DB: ${count}`);

        // 2. Get a user to check against
        const users = await User.find().limit(1);
        if (users.length === 0) {
            console.log('No users found!');
            return;
        }
        const user = users[0];
        console.log(`Checking scans for user: ${user.email} (ID: ${user._id})`);

        // 3. Find scans for this user
        const userScans = await ScanHistory.find({ userId: user._id }).sort({ createdAt: -1 }).limit(5);
        console.log(`Found ${userScans.length} scans for user.`);

        userScans.forEach(s => {
            console.log(` - [${s.type}] ${s.createdAt} - Content: ${s.content.substring(0, 20)}...`);
        });

    } catch (error) {
        console.error('Debug Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runDebug();
