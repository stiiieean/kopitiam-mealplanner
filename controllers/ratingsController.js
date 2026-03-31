const Store = require('../models/Store');

function avgRating(reviews) {
  if (!reviews || reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

exports.getAllStores = async (req, res) => {
  const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : null;
  const filter = maxBudget ? { budget: { $lte: maxBudget } } : {};

  try {
    const stores = await Store.retrieveAll(filter);
    console.log('Stores fetched:', stores.length);
    console.log(stores);

    const storesWithRating = stores.map(function(store) {
      return {
        _id: store._id,
        name: store.name,
        location: store.location,
        budget: store.budget,
        tags: store.tags,
        food: store.food,
        reviews: store.reviews,
        avgRating: avgRating(store.reviews),
      };
    });

    res.render('ratingboard', { stores: storesWithRating, maxBudget, sessionUser: req.session.user || null });

  } catch (error) {
    console.error(error);
    res.send('Error reading database');
  }
};

exports.getStoreById = async (req, res) => {
  const storeId = req.params.storeId;

  try {
    const store = await Store.retrieveById(storeId);

    if (!store) {
      return res.status(404).send('Store not found');
    }

    res.render('store', {
      store: {
        _id: store._id,
        name: store.name,
        location: store.location,
        budget: store.budget,
        lat: store.lat || null,
        lng: store.lng || null,
        tags: store.tags,
        food: store.food,
        reviews: store.reviews,
        avgRating: avgRating(store.reviews),
      },
      sessionUser: req.session.user || null,
    });

  } catch (error) {
    console.error(error);
    res.send('Error reading database');
  }
};