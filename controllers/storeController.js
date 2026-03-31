const Store = require('../models/Store');
const Review = require('../models/Review');

// GET /ratings/new
exports.getNewStore = (req, res) => {
  res.render('add-store', { error: null, formData: {} });
};

// POST /ratings/new
exports.postNewStore = async (req, res) => {
  const { name, location, budget, tags, food, lat, lng } = req.body;
  const formData = { name, location, budget, tags, food, lat, lng };

  if (!name || name.trim() === '') {
    return res.render('add-store', { error: 'Store name is required.', formData });
  }

  if (!location || location.trim() === '') {
    return res.render('add-store', { error: 'Location is required. Please search and select a location on the map.', formData });
  }

  if (!budget || isNaN(budget) || Number(budget) <= 0) {
    return res.render('add-store', { error: 'Please enter a valid budget greater than 0.', formData });
  }

  let tagsArray = [];
  if (tags) {
    tagsArray = Array.isArray(tags) ? tags : [tags];
  }

  let foodArray = [];
  if (food) {
    const raw = Array.isArray(food) ? food : [food];
    foodArray = raw.map(f => f.trim()).filter(f => f !== '');
  }

  try {
    await Store.createStore({
      name: name.trim(),
      location: location.trim(),
      budget: Number(budget),
      lat: lat ? Number(lat) : null,
      lng: lng ? Number(lng) : null,
      tags: tagsArray,
      food: foodArray,
      reviews: []
    });

    res.redirect('/ratings');
  } catch (err) {
    console.error(err);
    res.render('add-store', { error: 'Error saving store. Please try again.', formData });
  }
};

// POST /ratings/:storeId/delete
exports.deleteStore = async (req, res) => {
  const storeId = req.params.storeId;

  try {
    // Delete all reviews belonging to this store first
    await Review.deleteMany({ storeId: storeId });

    // Then delete the store itself
    await Store.deleteStore(storeId);

    res.redirect('/ratings');
  } catch (err) {
    console.error(err);
    res.send('Error deleting store');
  }
};
