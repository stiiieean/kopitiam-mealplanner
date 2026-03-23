const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  body: {
    type: String,
    required: true,
    minlength: 10
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

reviewSchema.statics.retrieveAll = function(){
  return this.find();
};

reviewSchema.statics.createReview = function(reviewData){
  return this.create(reviewData);
};

module.exports = mongoose.model('Review', reviewSchema);