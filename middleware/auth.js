// middleware/auth.js
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');

module.exports = {
  // Configure passport
  configurePassport: (app) => {
    // Configure passport local strategy
    passport.use(new LocalStrategy(async (username, password, done) => {
      try {
        // Find user
        const user = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password' });
        }
        
        // Check password
        const isValid = await user.comparePassword(password);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect username or password' });
        }
        
        // Successful login
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
    
    // Serialize user for the session
    passport.serializeUser((user, done) => {
      done(null, user.id);
    });
    
    // Deserialize user from the session
    passport.deserializeUser(async (id, done) => {
      try {
        const user = await User.findById(id);
        done(null, user);
      } catch (err) {
        done(err);
      }
    });
    
    // Initialize passport and restore authentication state if available
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Make current user available to all templates
    app.use((req, res, next) => {
      res.locals.currentUser = req.user;
      res.locals.isAuthenticated = req.isAuthenticated();
      next();
    });
  },
  
  // Middleware to check if user is authenticated
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'You must be logged in to do that');
    res.redirect('/login');
  }
};