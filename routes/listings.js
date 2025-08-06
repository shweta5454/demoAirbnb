const express = require("express");
const router = express.Router();
require("dotenv").config();
const path = require("path");
const wrapAsync = require("../utils/Wrapasync.js");
const Listing = require("../models/listingsSchema");
const { isloggedin, isOwner, validatelisting } = require("../middlewares.js");
const listingController = require("../controllers/listingController.js");
const multer  = require('multer')
const {storage}=require("../cloudConfig")
const upload = multer({storage })
// Index route 
router.get("/",wrapAsync(listingController.index));

// New form for creating new listing
 router.get("/new", isloggedin,listingController.newListingform );


router.route("/:id")
.put(isloggedin,
  isOwner,
  upload.single("listing[image]"),
  validatelisting,
  wrapAsync(listingController.updateListing)
)
.delete(
  isloggedin,
  isOwner,
  wrapAsync(listingController.deleteListing)
);

// Show route
router.get(
  "/:id/showroute",
  wrapAsync(listingController.showListing)
);



// Create Listing
router.post(
  "/create",
  isloggedin,
  upload.single("listing[image]"),
  validatelisting,
  wrapAsync(listingController.createListing)
);



// Edit Listing`
router.get(
  "/:id/edit",
  isloggedin,
  isOwner,
  wrapAsync(listingController.editListing)
);



module.exports = router;
