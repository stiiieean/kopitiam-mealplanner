const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

const SLOTS = ['breakfast', 'lunch', 'dinner', 'supper'];

// Auto-create store if the typed name doesn't exist yet
async function ensureStoreExists(storeName) {
  if (!storeName || storeName.trim() === '') return;
  const name = storeName.trim();
  const existing = await Store.find({ name: new RegExp(`^${name}$`, 'i') });
  if (existing.length === 0) {
    await Store.createStore({ name, location: 'Added from Meal Planner', budget: 0 });
  }
}

// GET /meal-planner — calendar view
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const month = req.query.month !== undefined ? parseInt(req.query.month) : today.getMonth();
    const year  = req.query.year  !== undefined ? parseInt(req.query.year)  : today.getFullYear();

    const user = await User.findById(req.session.user._id);
    if (!user) return res.redirect('/login');

    const firstDay    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Sum budgets across all 4 slots for the displayed month
    let totalBudget = 0;
    if (user.calendar) {
      for (const [dateString, dayPlan] of user.calendar.entries()) {
        const [y, m] = dateString.split('-');
        if (parseInt(y) === year && parseInt(m) === month + 1) {
          for (const slot of SLOTS) {
            if (dayPlan[slot] && dayPlan[slot].budget) {
              totalBudget += dayPlan[slot].budget;
            }
          }
        }
      }
    }

    res.render('meal-planner', {
      calendar: user.calendar || new Map(),
      month, year, firstDay, daysInMonth, totalBudget
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading calendar');
  }
});

// GET /meal-planner/:date — show 4-slot form for the day
router.get('/:date', async (req, res) => {
  try {
    const dateParam = req.params.date;
    const user   = await User.findById(req.session.user._id);
    const stores = await Store.find({});

    let existingPlan = null;
    if (user.calendar && user.calendar.has(dateParam)) {
      existingPlan = user.calendar.get(dateParam);
    }

    res.render('plan-meal', { date: dateParam, existingPlan, stores });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading form');
  }
});

// POST /meal-planner/:date — save all slots, auto-create new stores
router.post('/:date', async (req, res) => {
  try {
    const dateParam = req.params.date;
    const user = await User.findById(req.session.user._id);

    const dayPlan = {};

    for (const slot of SLOTS) {
      const slotData = req.body[slot];
      if (slotData && slotData.mealName && slotData.mealName.trim() !== '') {
        await ensureStoreExists(slotData.storeName);
        dayPlan[slot] = {
          mealName:  slotData.mealName.trim(),
          storeName: slotData.storeName ? slotData.storeName.trim() : '',
          notes:     slotData.notes     ? slotData.notes.trim()     : '',
          budget:    slotData.budget    ? parseFloat(slotData.budget) : 0
        };
      }
    }

    if (Object.keys(dayPlan).length > 0) {
      user.calendar.set(dateParam, dayPlan);
    } else {
      // All slots empty — remove the day
      user.calendar.delete(dateParam);
    }

    await user.save();
    res.redirect('/meal-planner');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving meal plan');
  }
});

// POST /meal-planner/:date/delete — clear entire day
router.post('/:date/delete', async (req, res) => {
  try {
    const dateParam = req.params.date;
    const user = await User.findById(req.session.user._id);

    if (user.calendar.has(dateParam)) {
      user.calendar.delete(dateParam);
      await user.save();
    }

    res.redirect('/meal-planner');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error deleting meal plan');
  }
});

module.exports = router;
