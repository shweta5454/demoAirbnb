const { listingSchema, reviewSchema } = require("./schema.js");
const CustomError = require("./utils/CustomError");

const Listing = require("./models/listingsSchema.js");
const Review= require("./models/reviewSchema.js");

module.exports.isloggedin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //redirect url
    req.session.redirecturl = req.originalUrl;
    req.flash("error", "You must be logged in to perform this action.");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirecturl) {
    res.locals.redirecturl = req.session.redirecturl;
  }
  next();
};

//isOwner listing
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;

  let listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }
  if (!listing.owner.equals(res.locals.curUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}/showroute`);
  }
  next();
};

//validate listing
module.exports.validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new CustomError(400, errmsg);
  } else {
    next();
  }
};

//validate review
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new CustomError(400, errmsg);
  } else {
    next();
  }
};

module.exports.isReviewOwner= async (req, res, next) => {
  let { id, reviewid } = req.params;

  let review = await Review.findById(reviewid);

  if (!review) {
    req.flash("error", "Review you requested does not exist.");
    return res.redirect(`/listings/${id}/showroute`);
  }
  if (!review.author.equals(res.locals.curUser._id)) {
    req.flash("error", "You are not the author of this review.");
    return res.redirect(`/listings/${id}/showroute`);
  }
  next();
};
