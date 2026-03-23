const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
// const fs = require('fs');

const server = express();

// Specify the path to the environment variablef file 'config.env'
dotenv.config({ path: './config.env' });

// Set view engine
server.set('view engine', 'ejs');
// server.set('views', path.join(__dirname, 'views'));

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, 'public')));
server.use(express.json());

// Routes
server.use('/menu', require('./routes/menu'));
server.use('/order', require('./routes/order'));
server.use('/reviews', require('./routes/reviews'));

server.use("/",require("./routes/user-routes"))


// Error handling middleware
// server.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).render('error', { error: err.message });
// });

// async function to connect to DB
async function connectDB() {
  try {
    // connecting to Database with our config.env file and DB is constant in config.env
    await mongoose.connect(process.env.DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = process.env.PORT || 8000; // Define port number
 
  // Start the server and listen on the specified hostname and port
  server.listen(port, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

// call connectDB first and when connection is ready we start the web server
connectDB().then(startServer);