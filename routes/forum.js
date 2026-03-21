const express = require('express');
const router = express.Router();
const forumController = require('../controllers/ForumController');

router.get('/', forumController.listPosts);

router.get('/create', forumController.showCreate);
router.post('/create', forumController.createPost);

router.get('/:id', forumController.getPost);

router.get('/edit/:id', forumController.showEdit);
router.post('/edit/:id', forumController.updatePost);

router.post('/delete/:id', forumController.deletePost);

router.post('/like/:id', forumController.likePost);

module.exports = router;