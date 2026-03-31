const mongoose = require('mongoose');

// One store entry inside a combination
const comboStoreSchema = new mongoose.Schema({
  storeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  storeName:   { type: String },
  location:    { type: String },
  tags:        [String],
  storeBudget: { type: Number },  // avg cost per pax at this store
  matchScore:  { type: Number },  // how many tags matched
}, { _id: false });

// One combination = one store per meal
const combinationSchema = new mongoose.Schema({
  stores:          [comboStoreSchema],  // one entry per meal
  totalCost:       { type: Number },    // sum of all store budgets
  totalMatchScore: { type: Number },    // sum of all match scores
}, { _id: false });

const foodHuntSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requirements: { type: String, required: true },  // comma-joined selected tags
  totalBudget:  { type: Number, required: true },
  numMeals:     { type: Number, required: true },
  results:      [combinationSchema],               // top 3 combinations
  createdAt:    { type: Date, default: Date.now },
});

const FoodHunt = mongoose.model('FoodHunt', foodHuntSchema, 'foodhunts');

exports.create = function(data) {
  return FoodHunt.create(data);
};

exports.findByUser = function(userId) {
  return FoodHunt.find({ userId }).sort({ createdAt: -1 });
};

exports.findById = function(id) {
  return FoodHunt.findById(id);
};

exports.updateById = function(id, data) {
  return FoodHunt.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteById = function(id) {
  return FoodHunt.findByIdAndDelete(id);
};
