const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Specify the path to the environment variable file 'config.env'
dotenv.config({ path: './config.env' });

const server = express();

// View engine setup
server.set('view engine', 'ejs');

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use(express.static('public'));

// Prevent browser from caching pages so back/forward never shows stale auth state
server.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// Session
server.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Register models
require('./models/Review');

// Routes
const authRouter = require('./routes/auth');
const homeRouter = require('./routes/home');
const ratingsRouter = require('./routes/ratings');
const reviewsRouter = require('./routes/reviews');
const mealPlannerRouter = require('./routes/mealPlanner');
const profileRouter = require('./routes/profile');
const adminRouter = require('./routes/admin');
const foodHuntRouter = require('./routes/foodHunt');
const challengesRouter = require('./routes/challenges');

server.use('/', authRouter);
server.use('/home', homeRouter);
server.use('/ratings', ratingsRouter);
server.use('/', reviewsRouter);
server.use('/meal-planner', mealPlannerRouter);
server.use('/profile', profileRouter);
server.use('/admin', adminRouter);
server.use('/food-hunt', foodHuntRouter);
server.use('/challenges', challengesRouter);

// Root redirect to login
server.get('/', (req, res) => res.redirect('/login'));

// Async function to connect to DB
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB, {
      tls: true,
      tlsAllowInvalidCertificates: false,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

function startServer() {
  const port = process.env.PORT || 8000;
  server.listen(port, () => console.log(`Server running at http://localhost:${port}/`));
}

// Call connectDB first and when connection is ready, start the web server
connectDB().then(startServer);
