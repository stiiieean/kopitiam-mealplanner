const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userid:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // TODO: add required:true once session is set up
  storeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: [true, 'A review must belong to a store'] },
  title:     { type: String, required: [true, 'A review must have a title'], maxlength: 100 },
  body:      { type: String, required: [true, 'A review must have a body'], minlength: 10 },
  rating:    { type: Number, required: [true, 'A review must have a rating'], min: 1, max: 5 },
  timestamp: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

module.exports = Review;
