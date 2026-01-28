
const express = require('express');
const router = express.Router();
// @desc    Test admin route
router.get('/test', (req, res) => res.send('Admin route works!'));


const Order = require('../models/Order'); 
router.get('/reports/today', async (req, res) => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    try {
        // 2. This is the MongoDB Aggregation Pipeline
        const salesReport = await Order.aggregate([
            {
                // Find orders created "today" and are "Completed"
                $match: {
                    createdAt: { $gte: startOfToday, $lt: endOfToday },
                    status: 'Completed' 
                }
            },
            {
                // Deconstruct the 'items' array into separate documents
                $unwind: '$items'
            },
            {
                // Group the documents by the item's name
                $group: {
                    _id: '$items.name', // Group by item name
                    totalSold: { $sum: '$items.quantity' }, 
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } 
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {

                $project: {
                    _id: 0, 
                    itemName: '$_id', 
                    totalSold: 1,
                    totalRevenue: 1
                }
            }
        ]);
        
        // 3. Send the final report as JSON
        res.json(salesReport);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;