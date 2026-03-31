const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userid:   { type: String, required: true, unique: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
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
