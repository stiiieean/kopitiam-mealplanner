const Forum = require('../models/Forum');

// GET /forum
exports.listPosts = async (req, res) => {
  try {
    const posts = await Forum.getAllPosts();
    res.render('forums', { posts, sessionUser: req.session.user });
  } catch (error) {
    console.error(error);
    res.send('Error loading forum posts');
  }
};

// GET /forum/new
exports.showCreate = (req, res) => {
  res.render('forum-form', { sessionUser: req.session.user });
};

// POST /forum/new  — multer parses multipart body so req.file and req.body are both available
exports.createPost = async (req, res) => {
  try {
    await Forum.createPost({
      title:    req.body.title,
      content:  req.body.content,
      userId:   req.session.user._id,
      photo:    req.file ? req.file.filename : null,
      location: {
        address: req.body.address  || '',
        lat:     req.body.lat      ? parseFloat(req.body.lat)  : null,
        lng:     req.body.lng      ? parseFloat(req.body.lng)  : null
      }
    });
    res.redirect('/forum');
  } catch (error) {
    console.error(error);
    res.send('Error creating post');
  }
};

// GET /forum/:id
exports.getPost = async (req, res) => {
  try {
    const post = await Forum.getPostById(req.params.id);
    if (!post) return res.redirect('/forum');
    res.render('forum-post', { post, sessionUser: req.session.user });
  } catch (error) {
    console.error(error);
    res.send('Error loading post');
  }
};

// GET /forum/:id/edit
exports.showEdit = async (req, res) => {
  try {
    const post = await Forum.getPostById(req.params.id);
    if (!post) return res.redirect('/forum');

    const isOwner = post.userId._id.toString() === req.session.user._id.toString();
    const isAdmin = req.session.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).redirect('/forum');

    res.render('forum-edit', { post, sessionUser: req.session.user });
  } catch (error) {
    console.error(error);
    res.send('Error loading edit form');
  }
};

// POST /forum/:id/edit  — multer parses multipart body
exports.updatePost = async (req, res) => {
  try {
    const post = await Forum.getPostById(req.params.id);
    if (!post) return res.redirect('/forum');

    const isOwner = post.userId._id.toString() === req.session.user._id.toString();
    const isAdmin = req.session.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).redirect('/forum');

    const updateData = {
      title:   req.body.title,
      content: req.body.content,
      location: {
        address: req.body.address || '',
        lat:     req.body.lat ? parseFloat(req.body.lat) : null,
        lng:     req.body.lng ? parseFloat(req.body.lng) : null
      }
    };

    // Only replace the photo if a new file was uploaded
    if (req.file) {
      updateData.photo = req.file.filename;
    }

    await Forum.updatePost(req.params.id, updateData);
    res.redirect('/forum/' + req.params.id);
  } catch (error) {
    console.error(error);
    res.send('Error updating post');
  }
};

// POST /forum/:id/delete
exports.deletePost = async (req, res) => {
  try {
    const post = await Forum.getPostById(req.params.id);
    if (!post) return res.redirect('/forum');

    const isOwner = post.userId._id.toString() === req.session.user._id.toString();
    const isAdmin = req.session.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).redirect('/forum');

    await Forum.deletePost(req.params.id);
    res.redirect('/forum');
  } catch (error) {
    console.error(error);
    res.send('Error deleting post');
  }
};

// POST /forum/:id/like  — redirectTo hidden field controls where to send user back
exports.likePost = async (req, res) => {
  try {
    await Forum.addLike(req.params.id, req.session.user._id);
    const redirectTo = req.body.redirectTo || '/forum';
    res.redirect(redirectTo);
  } catch (error) {
    console.error(error);
    res.send('Error liking post');
  }
};

// POST /forum/:id/reply  — multer parses multipart body for optional photo
exports.addReply = async (req, res) => {
  try {
    const photo = req.file ? req.file.filename : null;
    await Forum.addReply(req.params.id, req.session.user._id, req.body.content, photo);
    res.redirect('/forum/' + req.params.id);
  } catch (error) {
    console.error(error);
    res.send('Error adding reply');
  }
};
