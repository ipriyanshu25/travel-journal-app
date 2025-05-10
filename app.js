// app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');

// Helper to support both `module.exports = router` and `module.exports = { router }`
function loadRouter(routerPath) {
  const mod = require(routerPath);
  return mod.router || mod;
}

// Load routes
const authRoutes = loadRouter('./routes/auth');
const journalRoutes = loadRouter('./routes/journals');
const { configurePassport } = require('./middleware/auth');

// Initialize app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/travel-journal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Sessions & flash
app.use(session({
  secret: 'travel-journal-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Passport
configurePassport(app);

// Routes
app.use('/', authRoutes);
app.use('/', journalRoutes);

// Redirect root
app.get('/', (req, res) => res.redirect('/journals'));

// 404
app.use((req, res) => res.status(404).render('404'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { error: err });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
