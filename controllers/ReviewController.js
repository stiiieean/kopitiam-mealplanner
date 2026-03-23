const Review = require('./../models/Review');
// const Store = require('./../models/Store');

exports.getNewReview = async (req, res) => {
  const storeId = req.params.storeId;
  res.render("add-review", { storeId });
};

exports.postNewReview = async (req, res) => {
  try {
    const { title, body, rating } = req.body;
    const storeId = req.params.storeId;

    const review = new Review({
      userid: req.session.user._id,
      storeId,
      title,
      body,
      rating
    });

    await review.save();

    const store = await Store.findById(storeId);
    store.reviews.push(review._id);
    await store.save();

    res.redirect(`/ratings/${storeId}`);
  } catch (error) {
    console.log("Error posting review:", error);
    res.render("add-review", { storeId, error: "Error posting review" });
  }
};

exports.getEditReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.send("Review not found");

    res.render("edit-review", { review, storeId: review.storeId });
  } catch (error) {
    console.log("Error loading review:", error);
    res.render("edit-review", { error: "Error loading review" });
  }
};

exports.postEditReview = async (req, res) => {
  try {
    const { title, body, rating } = req.body;
    const reviewId = req.params.reviewId;

    await Review.findByIdAndUpdate(reviewId, { title, body, rating });
    const review = await Review.findById(reviewId);

    res.redirect(`/ratings/${review.storeId}`);
  } catch (error) {
    console.log("Error updating review:", error);
    res.render("edit-review", { error: "Error updating review" });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;
    const review = await Review.findById(reviewId);

    if (!review) return res.send("Review not found");

    await Store.findByIdAndUpdate(review.storeId, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/ratings/${review.storeId}`);
  } catch (error) {
    console.log("Error deleting review:", error);
    res.send("Error deleting review");
  }
};