const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const server = express();

dotenv.config({ path: './config.env' }); // load .env variables

server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Session
const secret = process.env.SECRET;
server.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// register model before using populate
require('./models/Review');

server.get('/', (req, res) => {
  res.redirect('/login');
});

// Routes
server.use('/menu', require('./routes/menu'));
server.use('/order', require('./routes/order'));
server.use('/reviews', require('./routes/reviews'));
server.use("/", require("./routes/auth"))

server.use(express.static(path.join(__dirname, 'public')));

// temp mock login for testing bruh - remember delete
server.use(async (req, res, next) => {
    if (!req.session.user) {
        const User = require('./models/User');
        let testUser = await User.findOne({ userid: 'tester123' });
        if (!testUser) {
            testUser = await User.create({
                userid: 'tester123',
                username: 'Demo Student',
                password: 'mockpassword',
                calendar: {}
            });
        }
        req.session.user = testUser;
    }
    next();
});

// routes
server.use('/meal-planner', require('./routes/mealPlanner'));

// connect to db and start server
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

function startServer() {
  const port = process.env.PORT || 8000; 
  server.listen(port, () => console.log(`Server running at http://localhost:${port}/`));
}

connectDB().then(startServer);