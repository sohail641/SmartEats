
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const multer = require('multer');
const path = require('path');

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// @route   GET /api/menu
router.get('/', async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ category: 1 }); 
        res.json(items);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' }); // Also changed to json
    }
});


// @route   POST /api/menu
router.post('/', upload.single('image'), async (req, res) => {
    
    const { name, price, description, category } = req.body;

    if (!req.file) {
        // --- FIX 1 ---
        // Was: res.status(400).send('Error: No image file uploaded');
        return res.status(400).json({ msg: 'Error: No image file uploaded' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    try {
        const newItem = new MenuItem({
            name,
            price,
            description,
            category,
            imageUrl: imageUrl
        });

        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error(err.message);
        
        res.status(400).json({ msg: 'Error adding menu item' });
    }
});

router.delete('/:itemId', async (req, res) => {
    try {
        const item = await MenuItem.findById(req.params.itemId);
        if (!item) {
            return res.status(404).json({ msg: 'Menu item not found' });
        }
        await item.deleteOne(); 
        res.json({ msg: 'Menu item removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' }); // Also changed to json
    }
});

module.exports = router;