const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'A store must have a name'] },
  location: { type: String, required: [true, 'A store must have a location'] },
  budget:   { type: Number, required: [true, 'A store must have a budget'] },
  food:     [String],
  tags:     [String],
  reviews:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
});

const StoreModel = mongoose.model('Store', storeSchema, 'stores');

// Retrieve all stores with optional filter
exports.retrieveAll = function(filter) {
  return StoreModel.find(filter).populate('reviews');
};

// Retrieve one store by ID — returns full mongoose document so .save() works
exports.retrieveById = function(id) {
  return StoreModel.findById(id).populate('reviews');
};