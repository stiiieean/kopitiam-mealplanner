const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const { requireLogin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(requireLogin);

router.get('/', forumController.listPosts);

// Specific named routes BEFORE /:id to prevent Express treating "new" as an ID
router.get('/new', forumController.showCreate);
router.post('/new', upload.single('photo'), forumController.createPost);

router.get('/:id/edit', forumController.showEdit);
router.post('/:id/edit', upload.single('photo'), forumController.updatePost);

router.post('/:id/delete', forumController.deletePost);
router.post('/:id/like', forumController.likePost);
router.post('/:id/reply', upload.single('photo'), forumController.addReply);

router.get('/:id', forumController.getPost);

module.exports = router;
