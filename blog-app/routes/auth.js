const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cookieParser = require('cookie-parser');  // Include cookie-parser
const path = require('path'); // Import path module
const User = require('../models/User');

// Set up multer for profile image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Use path.extname to get the file extension
    }
});
const upload = multer({ storage: storage });

// Sign Up
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', upload.single('profileImage'), async (req, res) => {
    const { email, password } = req.body;
    const profileImage = req.file ? `uploads/${req.file.filename}` : null;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            profileImage
        });
        await newUser.save();
        res.redirect('/login');
    } catch (err) {
        res.redirect('/signup');
    }
});

// Login
router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.redirect('/login');
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.redirect('/login');
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token).redirect('/dashboard');
    } catch (err) {
        res.redirect('/login');
    }
});

// Dashboard
router.get('/dashboard', async (req, res) => {
    const token = req.cookies.token;  // Now req.cookies is defined

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        res.render('dashboard', { user });
    } catch (err) {
        res.redirect('/login');
    }
});

module.exports = router;