
const mongoose = require('mongoose');
const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    price: {
        type: Number,
        required: true 
    },
    stock: { 
        type: Number, 
        default: 0 
    },
    description: {
        type: String
    },
    category: {
        type: String,
        default: 'General' 
    },
    imageUrl: {
        type: String, 
        default: ''
    }
});

// This creates the "model" (the actual collection in the DB)
module.exports = mongoose.model('MenuItem', menuItemSchema);