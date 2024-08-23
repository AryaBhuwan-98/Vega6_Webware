const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to authenticate user
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    jwt.verify(token, 'secretkey', (err, user) => {
        if (err) return res.redirect('/login');
        req.user = user;
        next();
    });
}

router.get('/', authenticateToken, async (req, res) => {
    const user = await User.findById(req.user.id);
    res.render('dashboard', { user });
});

module.exports = router;
