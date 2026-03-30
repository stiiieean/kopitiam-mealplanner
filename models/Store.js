const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    budget: {
        type: Number,
        required: true
    },
    food: [String],
    tags: [String],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

module.exports = mongoose.model('Store', storeSchema, 'Store')