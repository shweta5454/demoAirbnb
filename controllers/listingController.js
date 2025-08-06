const Listing = require("../models/listingsSchema");

//index route
module.exports.index = async (req, res) => {
  const data = await Listing.find();

  res.render("listings/index.ejs", { data });
};

//new listing form route
module.exports.newListingform = (req, res) => {
  res.render("listings/newlisting.ejs");
};

//show listing
module.exports.showListing = async (req, res, next) => {
  let { id } = req.params;
  const data = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!data) {
    req.flash("error", "Listing you requested does not exists");
    return res.redirect("/listings");
  }

  res.render("listings/showlisting.ejs", { data });
};

//create listing
module.exports.createListing = async (req, res, next) => {
  // let {title,description,image,price,location,country}=req.body;

  let url = req.file.path;
  let filename = req.file.filename;

  console.log(url, "..", filename);
  console.log(req.file);

  const newListing = new Listing(req.body.listing);
  newListing.image = { url, filename };
  newListing.owner = req.user._id;
  await newListing.save();

  req.flash("success", "New Listing created successfully!!!");
  res.redirect("/listings");
};

//edit listing
module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exists");
    return res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  console.log(originalImage);
  originalImage=originalImage.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing ,originalImage});
};

//update listing
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;

    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}/showroute`);
};

//delete listing
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
