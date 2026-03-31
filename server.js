const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');

// Specify the path to the environment variable file 'config.env'
dotenv.config({ path: './config.env' });

const server = express();

// View engine setup
server.set('view engine', 'ejs');

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use(express.static('public'));

// Session
server.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

// Register models
require('./models/Review');

// Routes
const authRouter = require('./routes/auth');
const homeRouter = require('./routes/home');
const ratingsRouter = require('./routes/ratings');
const reviewsRouter = require('./routes/reviews');

server.use('/', authRouter);
server.use('/home', homeRouter);
server.use('/ratings', ratingsRouter);
server.use('/', reviewsRouter);

// Root redirect to login
server.get('/', (req, res) => res.redirect('/login'));

// Async function to connect to DB
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

function startServer() {
  const hostname = 'localhost';
  const port = 8000;

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// Call connectDB first and when connection is ready, start the web server
connectDB().then(startServer);
