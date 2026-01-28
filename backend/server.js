const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(express.json()); // Lets our app understand JSON
app.use(cors());         // Allows cross-origin requests

// --- MongoDB Atlas Connection ---
// !! PASTE YOUR MONGODB ATLAS CONNECTION STRING HERE !!
const mongoURI = 'mongodb+srv://rocksohail306_db_user:WPoU3gU9BIxVkn75@cluster0.ol8tmwy.mongodb.net/';
// (This is the string from my last message)

mongoose.connect(mongoURI)
    .then(() => {
        console.log('MongoDB Atlas Connected Successfully!');
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1); // Exit process with failure
    });

// --- Simple Test Route ---
// This is a test to make sure our server is alive.
app.get('/', (req, res) => {
    res.send('Canteen Management System API is running!');
});

// --- API Routes ---
// This tells Express where to find our API "address book"
// --- API Routes ---
app.use('/api/auth', require('./routes/auth'));    
app.use('/api/menu', require('./routes/menu'));    
app.use('/api/orders', require('./routes/orders')); 
app.use('/api/admin', require('./routes/admin'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// --- Start The Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});