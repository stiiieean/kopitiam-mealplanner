const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid:   { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  calendar: {
    type: Map,
    of: new mongoose.Schema({
      mealName:  { type: String, required: true },
      storeName: { type: String },
      notes:     { type: String },
      budget:    { type: Number, min: 0 }
    }, { _id: false }),
    default: {}
  },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

const User = mongoose.model('User', userSchema);

exports.addUser = function(newUser) {
  return User.create(newUser);
};

exports.findUser = function(userid) {
  return User.findOne({ userid: userid });
};

exports.findById = function(id) {
  return User.findById(id);
};

exports.findByIdAndUpdate = function(id, update) {
  return User.findByIdAndUpdate(id, update, { new: true });
};

exports.findAll = function(projection) {
  return User.find({}, projection).sort({ role: 1, userid: 1 });
};

exports.deleteById = function(id) {
  return User.findByIdAndDelete(id);
};
