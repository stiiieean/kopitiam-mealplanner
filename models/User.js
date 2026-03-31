const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userid: {type: String, required: true, unique: true},
  username: { type: String, required: true},
  password: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

exports.addUser = function(newUser) {
  return User.create(newUser);
};

exports.findUser = function(userid) {
  return User.findOne({ userid: userid });
};