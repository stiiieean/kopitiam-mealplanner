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

    // Link the review to the store
    const store = await Store.retrieveById(storeId);
    store.reviews.push(savedReview._id);
    await store.save();

    res.redirect('/ratings/' + storeId);

  } catch (err) {
    console.error(err);
    res.send('Error saving review');
  }
};

// GET /review/:reviewId/edit
exports.getEditReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.send('Review not found');

    res.render('edit-review', { review, storeId: review.storeId, error: '' });
  } catch (error) {
    console.error('Error loading review:', error);
    res.send('Error loading review');
  }
};

// POST /review/:reviewId/edit
exports.postEditReview = async (req, res) => {
  const reviewId = req.params.reviewId;
  const { title, body, rating } = req.body;

  // Server-side validation
  let error = '';
  if (!title || title.trim() === '') {
    error = 'Title is required.';
  } else if (!body || body.trim().length < 10) {
    error = 'Review must be at least 10 characters.';
  } else if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    error = 'Rating must be between 1 and 5.';
  }

  if (error) {
    const review = await Review.findById(reviewId);
    return res.render('edit-review', { review, storeId: review.storeId, error });
  }

  try {
    await Review.findByIdAndUpdate(reviewId, {
      title: title.trim(),
      body: body.trim(),
      rating: Number(rating),
    });

    const review = await Review.findById(reviewId);
    res.redirect('/ratings/' + review.storeId);
  } catch (error) {
    console.error('Error updating review:', error);
    res.send('Error updating review');
  }
};

// POST /review/:reviewId/delete
exports.deleteReview = async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const review = await Review.findById(reviewId);
    if (!review) return res.send('Review not found');

    const storeId = review.storeId;

    await Store.retrieveById(storeId).then(async (store) => {
      store.reviews.pull(reviewId);
      await store.save();
    });

    await Review.findByIdAndDelete(reviewId);

    res.redirect('/ratings/' + storeId);
  } catch (error) {
    console.error('Error deleting review:', error);
    res.send('Error deleting review');
  }
};
