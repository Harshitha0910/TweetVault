require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
const path = require('path');
const authRoutes = require('./routes/auth.js');
const dashboardRoutes = require('./routes/dashboard.js');
const folderRoutes = require('./routes/folders.js');
const tweetRoutes = require('./routes/tweets.js');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests, please try again after 15 minutes',
    statusCode: 429,
  });

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key', // Replace with your own secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(limiter);


// Routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/folders', folderRoutes);
app.use('/tweets', tweetRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
