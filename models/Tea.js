const mongoose = require('mongoose');

const teaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['classic', 'fruit', 'milk', 'special'],
    required: true
  },
  imageUrl: {
    type: String,
    default: '/images/default-tea.jpg'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tea = mongoose.model('Tea', teaSchema, 'Tea');

//Methods here
exports.retrieveAll = function() {
  return Tea.find();
};

exports.findById = function(teaId) {
  return Tea.findOne({ _id: teaId });
};
