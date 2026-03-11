const Review = require('./../models/Review');
const Tea = require('./../models/Tea');

exports.showReviewForm = async (req, res) => {
    try {
        //const teas = await Tea.retrieveAll();
        let orderId = req.query.orderId || '';
        let customerId = req.query.customerId || '';
        let name = req.query.name != ''? req.query.name : 'Anonymous';

        res.render('review-form', {  orderId, customerId, name } )
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getReviewsPage = async (req, res) => {
  try {
    // const teas = await Tea.retrieveAll();

    const reviews = await Review.retrieveAll();
    //console.log(Array.isArray(reviews))
    // console.log(`Reviews ---- ${reviews}`);
    res.render('reviews', { reviews });
    //res.send('hello');

    // const reviews = await Review.find()
    //   .populate('tea')
    //   .populate('customer')
    //   .sort({ createdAt: -1 });

    // Group reviews by tea
    // const reviewsByTea = {};
    // teas.forEach(tea => {
    //   reviewsByTea[tea._id] = {
    //     tea: tea,
    //     reviews: reviews.filter(r => r.tea._id.toString() === tea._id.toString()),
    //     averageRating: 0
    //   };
    // });

    // Calculate average ratings
    // for (const teaId in reviewsByTea) {
    //   const teaReviews = reviewsByTea[teaId].reviews;
    //   if (teaReviews.length > 0) {
    //     const totalRating = teaReviews.reduce((sum, r) => sum + r.rating, 0);
    //     reviewsByTea[teaId].averageRating = (totalRating / teaReviews.length).toFixed(1);
    //   }
    // }

    // res.render('reviews', { reviewsByTea, teas });
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {

    const customerId = req.body.customerId;
    const name = req.body.name;
    const orderId = req.body.orderId;
    const comment = req.body.comment;
    const rating = req.body.rating

    const review = {
      customer: customerId,
      name: name,
      order: orderId,
      rating: rating,
      comment: comment
    };

    // console.log(review)

    let newReview = await Review.createReview(review);
    // res.json({ success: true, newReview });
    res.redirect('/reviews')
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// exports.getReviewsByTea = async (req, res) => {
//   try {
//     const teaId = req.params.teaId;
//     const tea = await Tea.findById(teaId);
//     const reviews = await Review.find({ tea: teaId })
//       .populate('customer')
//       .sort({ createdAt: -1 });

//     const averageRating = reviews.length > 0
//       ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
//       : 0;

//     res.json({ tea, reviews, averageRating, totalReviews: reviews.length });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getTeaStats = async (req, res) => {
//   try {
//     const teaId = req.params.teaId;
//     const reviews = await Review.find({ tea: teaId });

//     const stats = {
//       totalReviews: reviews.length,
//       averageRating: 0,
//       averageFlavor: 0,
//       averageTexture: 0,
//       averageSweetness: 0,
//       averageValue: 0,
//       ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
//     };

//     if (reviews.length > 0) {
//       let flavorSum = 0, textureSum = 0, sweetnessSum = 0, valueSum = 0, ratingSum = 0;

//       reviews.forEach(review => {
//         ratingSum += review.rating;
//         stats.ratingDistribution[review.rating]++;

//         if (review.flavor) flavorSum += review.flavor;
//         if (review.texture) textureSum += review.texture;
//         if (review.sweetness) sweetnessSum += review.sweetness;
//         if (review.value) valueSum += review.value;
//       });

//       stats.averageRating = (ratingSum / reviews.length).toFixed(1);
//       stats.averageFlavor = reviews.some(r => r.flavor) ? (flavorSum / reviews.length).toFixed(1) : 0;
//       stats.averageTexture = reviews.some(r => r.texture) ? (textureSum / reviews.length).toFixed(1) : 0;
//       stats.averageSweetness = reviews.some(r => r.sweetness) ? (sweetnessSum / reviews.length).toFixed(1) : 0;
//       stats.averageValue = reviews.some(r => r.value) ? (valueSum / reviews.length).toFixed(1) : 0;
//     }

//     res.json(stats);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
