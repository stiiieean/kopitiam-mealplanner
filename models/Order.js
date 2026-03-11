const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [{
    tea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tea',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    sugarLevel: String,
    iceLevel: String,
    toppings: [String],
    price: Number
  }],
  totalPrice: {
    type: Number,
    required: true
  },

  specialInstructions: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema, 'Order');

exports.findByID = function(orderId) {
  return Order.findOne({ orderId: orderId });
};

exports.createOrder = function(newOrder) {
  return Order.create(newOrder);
};

exports.editOrder = function(orderId, tea) {
  return Order.updateOne({orderId: orderId} ,{tea: tea});
};

exports.deleteOrder = function(orderId) {
  return Order.deleteOne({orderId: orderId});
};

