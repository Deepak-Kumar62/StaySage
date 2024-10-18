const Listing = require("../models/listing");
const Reviews = require("../models/review");

module.exports.createReview = async (req, res, next) => {
  const { id } = req.params;
  const newReview = new Reviews(req.body.reviews);
  newReview.author = req.user._id;
  const listing = await Listing.findById(id);
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash("success", "New review is created successfully.");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res, next) => {
  const { id, review_id } = req.params;
  await Reviews.findByIdAndDelete(review_id);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: review_id } });
  req.flash("success", "Review is deleted successfully.");
  res.redirect(`/listings/${id}`);
};

