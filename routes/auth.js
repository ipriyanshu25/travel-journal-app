const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

// Registration form
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// Handle registration
router.post('/register', async (req, res) => {
  try {
    const { username, password, nationality, travelStyle, favoriteContinent } = req.body;
    const errors = [];
    if (!username) errors.push('Username is required');
    if (!password) errors.push('Password is required');
    if (password && password.length < 6) errors.push('Password must be at least 6 characters');
    if (!nationality) errors.push('Nationality is required');
    if (!travelStyle) errors.push('Travel style is required');
    if (!favoriteContinent) errors.push('Favorite continent is required');

    const existingUser = await User.findOne({ username });
    if (existingUser) errors.push('Username already exists');

    if (errors.length) {
      return res.render('auth/register', { errors, formData: req.body });
    }

    const newUser = new User({ username, password, nationality, travelStyle, favoriteContinent });
    await newUser.save();
    req.flash('success', 'Registration successful! You can now log in.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Login form
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Handle login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/journals',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.flash('success', 'Successfully logged out');
    res.redirect('/login');
  });
});

module.exports = router;
