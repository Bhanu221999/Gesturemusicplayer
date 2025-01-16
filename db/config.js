
const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose');
const uri = process.env.URI;
const connectDb = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/musicplayer', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDb;