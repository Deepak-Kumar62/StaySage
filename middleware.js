const Listing = require("./models/listing.js");
const Review = require("./models/review");
const { listingSchema, reviesSchema } = require("./schema.js");
const ExpressError = require("./utilities/expressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currentUser._id)) {
    req.flash("error", "You don't have permission to edit.");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    let errorMessage = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }
};


module.exports.validateReview = (req, res, next) => {
  const { error } = reviesSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errorMessage);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, review_id } = req.params;
  console.log(id, review_id)
  const review = await Review.findById(review_id);
  console.log(review)
  if(!review.author.equals(res.locals.currentUser._id)){
    req.flash("error", "You are not the author of this review.");
    return res.redirect(`/listings/${ id }`);
  }
  next();
}