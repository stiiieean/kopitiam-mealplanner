const Store = require('../models/Store');
const Review = require('../models/Review');

// GET /home
exports.getHome = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const allStores = await Store.find({});

    // --- Nearby stores (coordinates required) ---
    const stores = allStores
      .filter(s => s.lat && s.lng)
      .map(s => ({
        _id: s._id,
        name: s.name,
        location: s.location,
        budget: s.budget,
        lat: s.lat,
        lng: s.lng,
        tags: s.tags
      }));

    // --- Review-based recommendations ---
    // Step 1: Find all stores the user has already reviewed
    const userReviews = await Review.find({ userid: req.session.user._id });
    const reviewedStoreIds = userReviews.map(r => r.storeId.toString());

    // Step 2: Count tag frequency across reviewed stores to learn preferences
    const tagCount = {};
    allStores.forEach(s => {
      if (reviewedStoreIds.includes(s._id.toString())) {
        s.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    // Step 3: Score unvisited stores by how many preferred tags they share
    const unvisited = allStores.filter(s => !reviewedStoreIds.includes(s._id.toString()));

    let recommended;

    if (Object.keys(tagCount).length === 0) {
      // User has no reviews yet — fall back to showing top-rated stores
      const storesWithRatings = allStores.map(s => {
        const total = s.reviews ? s.reviews.length : 0;
        return { store: s, reviewCount: total };
      });
      storesWithRatings.sort((a, b) => b.reviewCount - a.reviewCount);
      recommended = storesWithRatings.slice(0, 3).map(r => ({
        _id: r.store._id,
        name: r.store.name,
        location: r.store.location,
        budget: r.store.budget,
        tags: r.store.tags,
        reason: 'Popular on Kopitiam'
      }));
    } else {
      // Score each unvisited store
      const scored = unvisited.map(s => {
        let score = 0;
        s.tags.forEach(tag => {
          if (tagCount[tag]) score += tagCount[tag];
        });
        return { store: s, score };
      });

      scored.sort((a, b) => b.score - a.score);

      // Only include stores with at least one matching tag
      const matched = scored.filter(r => r.score > 0).slice(0, 3);

      if (matched.length === 0) {
        // All stores have been visited or no tag matches — show remaining unvisited
        recommended = unvisited.slice(0, 3).map(s => ({
          _id: s._id,
          name: s.name,
          location: s.location,
          budget: s.budget,
          tags: s.tags,
          reason: 'You haven\'t tried this yet'
        }));
      } else {
        // Build the top tag label for each recommendation
        recommended = matched.map(r => {
          const topTag = r.store.tags.find(tag => tagCount[tag]);
          return {
            _id: r.store._id,
            name: r.store.name,
            location: r.store.location,
            budget: r.store.budget,
            tags: r.store.tags,
            reason: topTag ? `Because you like ${topTag}` : 'Matches your taste'
          };
        });
      }
    }

    res.render('home', { user: req.session.user, stores, recommended });
  } catch (error) {
    console.error(error);
    res.render('home', { user: req.session.user, stores: [], recommended: [] });
  }
};
