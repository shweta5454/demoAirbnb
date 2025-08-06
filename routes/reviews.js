const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../models/reviewSchema");
const CustomError = require("../utils/CustomError.js");
const wrapAsync = require("../utils/Wrapasync");
const { validateReview ,isloggedin,isReviewOwner } = require("../middlewares.js");
const Listing = require("../models/listingsSchema.js");
const reviewController=require("../controllers/reviewController")

// Review routes

//create review route
router.post(
  "/",isloggedin,
  validateReview,
  wrapAsync(reviewController.createReview)
);

//Delete review route
router.delete(
  "/:reviewid",isloggedin,isReviewOwner,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
