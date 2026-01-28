
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth'); // <-- 1. IMPORT AUTH MIDDLEWARE

// --- ROUTES ---


router.post('/', auth, async (req, res) => {

    
    const { items, totalPrice } = req.body;

    try {
        const newOrder = new Order({
            // --- 3. LINK TO LOGGED-IN USER ---
            customer: req.user.id, // We get this from the auth token
            items: items,
            totalPrice: totalPrice
        });

        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        console.error(err.message);
        res.status(400).send('Error creating order');
    }
});

// @route   GET /api/orders
// @desc    Get all orders (For Admin/Kitchen)
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 }) // Newest first
            .populate('customer', 'username'); // Also get the customer's username
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//
// --- 4. ADD THIS NEW ROUTE ---
//

router.get('/myhistory', auth, async (req, res) => {
    try {
       
        const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.put('/:orderId', async (req, res) => {
    const { status } = req.body; 

    if (!['Pending', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.orderId,
            { status: status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        
        res.json(updatedOrder);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;