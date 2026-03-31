const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Store = require('../models/Store');

// check authoriz
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) return next();
    res.redirect('/login');
}

router.use(isAuthenticated);

// check callendar
router.get('/', async (req, res) => {
    try {
        const today = new Date();
        const month = req.query.month ? parseInt(req.query.month) : today.getMonth();
        const year = req.query.year ? parseInt(req.query.year) : today.getFullYear();

        const user = await User.findById(req.session.user._id);
        if (!user) return res.redirect('/login');

        // get calendar grid math
        const firstDay = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // 0 gets last day of current month

        // calc total spend
        let totalBudget = 0;
        if (user.calendar) {
            for (let [dateString, mealData] of user.calendar.entries()) {
                const [y, m] = dateString.split('-');
                if (parseInt(y) === year && parseInt(m) === month + 1) {
                    if (mealData.budget) totalBudget += mealData.budget;
                }
            }
        }

        res.render('meal-planner', {
            user: user,
            calendar: user.calendar || new Map(),
            month: month,
            year: year,
            firstDay: firstDay,
            daysInMonth: daysInMonth, // passing the fixed variable
            totalBudget: totalBudget
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading calendar");
    }
});

// render form to add or edit meal
router.get('/:date', async (req, res) => {
    try {
        const dateParam = req.params.date;
        const user = await User.findById(req.session.user._id);
        const stores = await Store.find({}); // get stores for dropdown

        let existingPlan = null;
        if (user.calendar && user.calendar.has(dateParam)) {
            existingPlan = user.calendar.get(dateParam);
        }

        res.render('plan-meal', {
            date: dateParam,
            existingPlan: existingPlan,
            stores: stores
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading form");
    }
});

// save form data to db
router.post('/:date', async (req, res) => {
    try {
        const dateParam = req.params.date;
        const { mealName, storeName, notes, budget } = req.body;
        const user = await User.findById(req.session.user._id);

        // save directly using map key
        user.calendar.set(dateParam, {
            mealName: mealName,
            storeName: storeName,
            notes: notes,
            budget: budget ? parseFloat(budget) : 0
        });

        await user.save();
        res.redirect('/meal-planner');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving meal plan");
    }
});

// delete meal plan for the day
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
        res.status(500).send("Error deleting meal plan");
    }
});

module.exports = router;