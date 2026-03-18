const Review = require('../models/Review');
const Store = require('../models/Store');

// GET /ratings/:storeId/review/new
exports.getNewReview = async (req, res) => {
  const storeId = req.params.storeId;

  try {
    const store = await Store.retrieveById(storeId);

    if (!store) {
      return res.status(404).send('Store not found');
    }

    res.render('add-review', {
      storeId: store._id,
      storeName: store.name,
      error: '',
    });

  } catch (error) {
    console.error(error);
    res.send('Error loading review form');
  }
};

// POST /ratings/:storeId/review/new
exports.postNewReview = async (req, res) => {
  const storeId = req.params.storeId;
  const title = req.body.title;
  const body = req.body.body;
  const rating = Number(req.body.rating);

  // TODO: replace with req.session.user._id once session is set up
  // const userId = req.session.user._id;

  // Server-side validation
  let error = '';
  if (!title || title.trim() === '') {
    error = 'Title is required.';
  } else if (!body || body.trim().length < 10) {
    error = 'Review must be at least 10 characters.';
  } else if (!rating || rating < 1 || rating > 5) {
    error = 'Rating must be between 1 and 5.';
  }

  if (error) {
    return res.render('add-review', {
      storeId,
      storeName: req.body.storeName,
      error,
    });
  }

  try {
    const newReview = new Review({
      storeId: storeId,
      title: title.trim(),
      body: body.trim(),
      rating: rating,
      timestamp: Date.now(),
    });

    const savedReview = await newReview.save();
    console.log('Review saved:', savedReview);

    // Link the review to the store
    const store = await Store.retrieveById(storeId);
    store.reviews.push(savedReview._id);
    await store.save();
    console.log('Review linked to store:', store.name);

    res.redirect('/ratings/' + storeId);

  } catch (err) {
    console.error(err);
    res.send('Error saving review');
  }
};