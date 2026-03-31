const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },

  // Array of users who have marked this challenge as complete
  completedBy: [{
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedAt: { type: Date, default: Date.now }
  }],

  createdAt: { type: Date, default: Date.now }
});

const Challenge = mongoose.model('Challenge', challengeSchema, 'challenges');

exports.findAll = function() {
  return Challenge.find().sort({ createdAt: -1 });
};

exports.findById = function(id) {
  return Challenge.findById(id);
};

exports.create = function(data) {
  return Challenge.create(data);
};

exports.updateById = function(id, data) {
  return Challenge.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteById = function(id) {
  return Challenge.findByIdAndDelete(id);
};
