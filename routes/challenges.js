const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const { requireLogin, requireAdmin } = require('../middleware/auth');

router.use(requireLogin);

// GET /challenges — list all challenges
router.get('/', async (req, res) => {
  try {
    const challenges = await Challenge.findAll();
    res.render('challenges', { challenges, sessionUser: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading challenges');
  }
});

// GET /challenges/new — admin only, blank form
router.get('/new', requireAdmin, (req, res) => {
  res.render('challenge-form', { challenge: null, error: null });
});

// POST /challenges/new — admin only, save
router.post('/new', requireAdmin, async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.render('challenge-form', { challenge: null, error: 'Title is required.' });
  }
  if (!description || description.trim() === '') {
    return res.render('challenge-form', { challenge: null, error: 'Description is required.' });
  }

  try {
    await Challenge.create({ title: title.trim(), description: description.trim() });
    res.redirect('/challenges');
  } catch (err) {
    console.error(err);
    res.render('challenge-form', { challenge: null, error: 'Error saving challenge.' });
  }
});

// GET /challenges/:id/edit — admin only
router.get('/:id/edit', requireAdmin, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.redirect('/challenges');
    res.render('challenge-form', { challenge, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading challenge');
  }
});

// POST /challenges/:id/edit — admin only
router.post('/:id/edit', requireAdmin, async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    const challenge = await Challenge.findById(req.params.id);
    return res.render('challenge-form', { challenge, error: 'Title is required.' });
  }
  if (!description || description.trim() === '') {
    const challenge = await Challenge.findById(req.params.id);
    return res.render('challenge-form', { challenge, error: 'Description is required.' });
  }

  try {
    await Challenge.updateById(req.params.id, { title: title.trim(), description: description.trim() });
    res.redirect('/challenges');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating challenge');
  }
});

// POST /challenges/:id/delete — admin only
router.post('/:id/delete', requireAdmin, async (req, res) => {
  try {
    await Challenge.deleteById(req.params.id);
    res.redirect('/challenges');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting challenge');
  }
});

// POST /challenges/:id/complete — user marks as complete
router.post('/:id/complete', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.redirect('/challenges');

    const userId = req.session.user._id.toString();
    const alreadyDone = challenge.completedBy.some(c => c.userId.toString() === userId);

    if (!alreadyDone) {
      challenge.completedBy.push({ userId: req.session.user._id });
      await challenge.save();
    }

    res.redirect('/challenges');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error completing challenge');
  }
});

// POST /challenges/:id/uncomplete — user undoes their completion
router.post('/:id/uncomplete', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.redirect('/challenges');

    const userId = req.session.user._id.toString();
    challenge.completedBy = challenge.completedBy.filter(c => c.userId.toString() !== userId);
    await challenge.save();

    res.redirect('/challenges');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error undoing challenge');
  }
});

module.exports = router;
