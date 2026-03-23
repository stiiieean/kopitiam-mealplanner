const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userid: {type: Number, required: true, unique: true},
  username: { type: String, required: true},
  password: { type: String, required: true },
  agree:{ type: Boolean, required: true}
});

const User = mongoose.model('User', UserSchema);

exports.addUser = function(newUser) {
  return User.create(newUser);
};

exports.findUser = function(username) {
  return User.findOne({ username: username });
};