const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  photo:     { type: String, default: null },   // filename stored in public/uploads/forum/
  createdAt: { type: Date, default: Date.now }
});

const forumSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  content:  { type: String, required: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo:    { type: String, default: null },     // filename stored in public/uploads/forum/
  location: {
    address: { type: String, default: '' },
    lat:     { type: Number, default: null },
    lng:     { type: Number, default: null }
  },
  createdAt: { type: Date, default: Date.now },
  likes:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies:   [replySchema]
});

const Forum = mongoose.model('Forum', forumSchema);

// CRUD operations
exports.createPost = function(data) {
  return Forum.create(data);
};

exports.getAllPosts = function() {
  return Forum.find()
    .populate('userId', 'username')
    .sort({ createdAt: -1 });
};

exports.getPostById = function(id) {
  return Forum.findById(id)
    .populate('userId', 'username')
    .populate('replies.userId', 'username');
};

exports.updatePost = function(id, data) {
  return Forum.findByIdAndUpdate(id, data, { new: true });
};

exports.deletePost = function(id) {
  return Forum.findByIdAndDelete(id);
};

exports.addLike = async function(id, userId) {
  // Existing documents may still have likes stored as a Number (old schema).
  // $addToSet requires an array, so reset it to [] first if needed.
  const post = await Forum.findById(id).lean();
  if (post && !Array.isArray(post.likes)) {
    await Forum.updateOne({ _id: id }, { $set: { likes: [] } });
  }
  return Forum.findByIdAndUpdate(
    id,
    { $addToSet: { likes: userId } },
    { new: true }
  );
};

exports.addReply = function(id, userId, content, photo) {
  return Forum.findByIdAndUpdate(
    id,
    { $push: { replies: { userId, content, photo: photo || null } } },
    { new: true }
  );
};
