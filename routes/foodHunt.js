const express = require('express');
const router = express.Router();
const FoodHunt = require('../models/FoodHunt');
const Store = require('../models/Store');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Generate all combinations of k items from arr, repetition allowed.
// e.g. combinationsWithRep([A,B,C], 2) → [A,A],[A,B],[A,C],[B,B],[B,C],[C,C]
function combinationsWithRep(arr, k) {
  if (k === 1) return arr.map(x => [x]);
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const subCombos = combinationsWithRep(arr.slice(i), k - 1);
    for (const sub of subCombos) {
      result.push([arr[i], ...sub]);
    }
  }
  return result;
}

// ─── Recommendation Algorithm ────────────────────────────────────────────────
// 1. Score every store by how many selected tags appear in its tags/name/food
// 2. Generate all combinations of numMeals stores (repetition allowed)
// 3. Keep only combinations whose total cost fits within totalBudget
// 4. Sort by total match score (desc), then by total cost (cheapest first)
// 5. Return top 3 combinations
function getTopRecommendations(stores, requirements, totalBudget, numMeals) {
  // Split "halal,chinese,hawker" → ['halal','chinese','hawker']
  const keywords = requirements.split(',').map(k => k.trim()).filter(k => k.length > 0);

  // Score every store
  const scoredStores = stores.map(store => {
    const searchText = [store.name, ...store.tags, ...store.food].join(' ').toLowerCase();
    const matchScore = keywords.filter(kw => searchText.includes(kw)).length;
    return { store, matchScore };
  });

  // Generate all possible combinations of numMeals stores
  const allCombos = combinationsWithRep(scoredStores, numMeals);

  // Filter combos that fit within budget, then score and sort
  const validCombos = allCombos
    .map(combo => {
      const totalCost       = combo.reduce((sum, s) => sum + s.store.budget, 0);
      const totalMatchScore = combo.reduce((sum, s) => sum + s.matchScore,   0);
      return { combo, totalCost, totalMatchScore };
    })
    .filter(c => c.totalCost <= totalBudget)
    .sort((a, b) => {
      // Most tag matches first; ties broken by cheapest combination
      if (b.totalMatchScore !== a.totalMatchScore) return b.totalMatchScore - a.totalMatchScore;
      return a.totalCost - b.totalCost;
    });

  // Return top 3, formatting each combination for storage
  return validCombos.slice(0, 3).map(({ combo, totalCost, totalMatchScore }) => ({
    totalCost,
    totalMatchScore,
    stores: combo.map(({ store, matchScore }) => ({
      storeId:     store._id,
      storeName:   store.name,
      location:    store.location,
      tags:        store.tags,
      storeBudget: store.budget,
      matchScore,
    })),
  }));
}

// ─── GET /food-hunt — list all past hunts ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const hunts = await FoodHunt.findByUser(req.session.user._id);
    res.render('food-hunt-list', { hunts });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading food hunts');
  }
});

// ─── GET /food-hunt/new — show blank form ────────────────────────────────────
router.get('/new', async (req, res) => {
  res.render('food-hunt-form', { hunt: null, error: null });
});

// ─── POST /food-hunt/new — run algorithm and save ────────────────────────────
router.post('/new', async (req, res) => {
  const { totalBudget, numMeals } = req.body;
  const tagsRaw = req.body.tags;
  const tags = tagsRaw ? (Array.isArray(tagsRaw) ? tagsRaw : [tagsRaw]) : [];

  if (tags.length === 0) {
    return res.render('food-hunt-form', { hunt: null, error: 'Please select at least one tag.' });
  }
  if (!totalBudget || isNaN(totalBudget) || Number(totalBudget) <= 0) {
    return res.render('food-hunt-form', { hunt: null, error: 'Please enter a valid total budget.' });
  }
  if (!numMeals || isNaN(numMeals) || Number(numMeals) < 1) {
    return res.render('food-hunt-form', { hunt: null, error: 'Please select the number of meals.' });
  }

  const requirements = tags.join(',');

  try {
    const stores = await Store.find({});
    const results = getTopRecommendations(stores, requirements, Number(totalBudget), Number(numMeals));

    const hunt = await FoodHunt.create({
      userId:       req.session.user._id,
      requirements,
      totalBudget:  Number(totalBudget),
      numMeals:     Number(numMeals),
      results,
    });

    res.redirect(`/food-hunt/${hunt._id}`);
  } catch (err) {
    console.error(err);
    res.render('food-hunt-form', { hunt: null, error: 'Error running food hunt. Please try again.' });
  }
});

// ─── GET /food-hunt/:id — view a saved hunt and its results ──────────────────
router.get('/:id', async (req, res) => {
  try {
    const hunt = await FoodHunt.findById(req.params.id);
    if (!hunt || hunt.userId.toString() !== req.session.user._id.toString()) {
      return res.redirect('/food-hunt');
    }
    res.render('food-hunt-result', { hunt });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading food hunt');
  }
});

// ─── GET /food-hunt/:id/edit — show pre-filled edit form ─────────────────────
router.get('/:id/edit', async (req, res) => {
  try {
    const hunt = await FoodHunt.findById(req.params.id);
    if (!hunt || hunt.userId.toString() !== req.session.user._id.toString()) {
      return res.redirect('/food-hunt');
    }
    res.render('food-hunt-form', { hunt, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading food hunt');
  }
});

// ─── POST /food-hunt/:id/edit — recalculate and update ───────────────────────
router.post('/:id/edit', async (req, res) => {
  const { totalBudget, numMeals } = req.body;
  const tagsRaw = req.body.tags;
  const tags = tagsRaw ? (Array.isArray(tagsRaw) ? tagsRaw : [tagsRaw]) : [];

  if (tags.length === 0) {
    const hunt = await FoodHunt.findById(req.params.id);
    return res.render('food-hunt-form', { hunt, error: 'Please select at least one tag.' });
  }
  if (!totalBudget || isNaN(totalBudget) || Number(totalBudget) <= 0) {
    const hunt = await FoodHunt.findById(req.params.id);
    return res.render('food-hunt-form', { hunt, error: 'Please enter a valid total budget.' });
  }
  if (!numMeals || isNaN(numMeals) || Number(numMeals) < 1) {
    const hunt = await FoodHunt.findById(req.params.id);
    return res.render('food-hunt-form', { hunt, error: 'Please select the number of meals.' });
  }

  const requirements = tags.join(',');

  try {
    const stores = await Store.find({});
    const results = getTopRecommendations(stores, requirements, Number(totalBudget), Number(numMeals));

    await FoodHunt.updateById(req.params.id, {
      requirements,
      totalBudget:  Number(totalBudget),
      numMeals:     Number(numMeals),
      results,
    });

    res.redirect(`/food-hunt/${req.params.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating food hunt');
  }
});

// ─── POST /food-hunt/:id/delete — remove a hunt ──────────────────────────────
router.post('/:id/delete', async (req, res) => {
  try {
    const hunt = await FoodHunt.findById(req.params.id);
    if (hunt && hunt.userId.toString() === req.session.user._id.toString()) {
      await FoodHunt.deleteById(req.params.id);
    }
    res.redirect('/food-hunt');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting food hunt');
  }
});

module.exports = router;
