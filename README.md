# Bubbly Bliss - Bubble Tea Order Application

A full-stack web application for ordering bubble tea, built with Express.js, MongoDB, and EJS templates using MVC architecture.

## Features

- **Bubble Tea Menu**: Select teas 
- **Order Confirmation**: Confirm order with review option
- **Customer Reviews**: View and rate the tea experience
## Additional features that you can add 
- **Order History**: View order history and re-order again
- **Favorite Tea**: Like favorite teas, Menu will show how many 'likes' for each tea
- **Personalized Recommendations**: Get tea suggestions based on preferences and order history
- **User Account**: Create User Account and Log In/Out

## Tech Stack

- **Backend**: Express.js with MVC architecture
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML
- **Templates**: EJS
- **Environment**: Node.js

## Project Structure

```
bubbly-bliss/
├── controllers/          # MVC Controllers
│   ├── TeaController.js
│   ├── OrderController.js
│   ├── ReviewController.js
├── models/              # MongoDB Models
│   ├── Tea.js
│   ├── Customer.js
│   ├── Order.js
│   └── Review.js
├── routes/              # Express Routes
│   ├── menu.js
│   ├── orders.js
│   ├── reviews.js
├── views/               # EJS Templates
│   ├── menu.ejs
│   ├── review-form.ejs
│   ├── reviews.ejs
│   └── error.ejs
├── public/              # Static assets (images)
├── server.js               # Main application file
├── package.json
├── config.env                 # Environment variables
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bubbly-bliss
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Update the `DB` in `config.env` file

4. **Seed the database** (optional)
   ```bash
   node seed-db.js
   ```

5. **Start the application**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:8000
   ```

## Usage

### For Customers
1. **Browse Menu**: Visit the home page and go to the Menu page to browse all available teas, and make your tea selection
2. **Confirmation**: Confirm the tea order and optionally provide review 
3. **View Reviews**: Check the Reviews page to see customer feedback on their orders


### For Developers
- **Models**: Define data structures in the `models/` directory
- **Controllers**: Handle business logic in the `controllers/` directory
- **Routes**: Define API endpoints in the `routes/` directory
- **Views**: Create EJS templates in the `views/` directory

## API Endpoints
### Tea Menu
- `GET /menu` - Get all teas

### Order
- `GET /order` - Create new order

### Reviews
- `GET /reviews` - Get all reviews
- `GET /reviews/create` - Get review form to provide review
- `POST /reviews/create` - Create new review

## Database Schema
### Tea
- name: String
- description: String
- basePrice: Number
- category: String (classic, fruit, milk, special)
- imageUrl: String
- isAvailable: Boolean
- tags: [String]

### Customer
- name: String
- email: String (unique)
- phone: String
- preferences: Object
- orderHistory: [ObjectId]

### Order
- orderId: String (unique)
- customer: ObjectId
- name: String
- items: [Object]
- totalPrice: Number
- status: String
- pickupTime: Date
- specialInstructions: String

### Review
- customer: ObjectId
- order: ObjectId
- rating: Number (1-5)
- comment: String

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
