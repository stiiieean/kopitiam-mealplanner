const Forum = require('../models/Forum');

exports.listPosts = async (req, res) => {
  const posts = await Forum.getAllPosts();
  res.render('forums', { posts });
};

exports.showCreate = (req, res) => {
  res.render('forum-form');
};

exports.createPost = async (req, res) => {
  await Forum.createPost({
    title: req.body.title,
    content: req.body.content,
    userId: req.session.user._id
  });

  res.redirect('/forum');
};

exports.getPost = async (req, res) => {
  const post = await Forum.getPostById(req.params.id);

  if (!post) {
    return res.redirect('/forum');
  }

  res.render('forum-post', { post });
};

exports.showEdit = async (req, res) => {
  const post = await Forum.getPostById(req.params.id);

  if (!post) {
    return res.redirect('/forum');
  }

  res.render('forum-edit', { post });
};

exports.updatePost = async (req, res) => {
  await Forum.updatePost(req.params.id, {
    title: req.body.title,
    content: req.body.content
  });

  res.redirect('/forum/' + req.params.id);
};

exports.deletePost = async (req, res) => {
  await Forum.deletePost(req.params.id);
  res.redirect('/forum');
};

exports.likePost = async (req, res) => {
  await Forum.addOneLike(req.params.id);
  res.redirect('/forum/' + req.params.id);
};