const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const review = require("../models/review");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewListingForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist.");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  const response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  const path = req.file.path;
  const fileName = req.file.filename;
  const listing = req.body.listing;
  listing.owner = req.user._id;
  const newListing = new Listing(listing);
  newListing.image = { path, fileName };
  newListing.geometry = response.body.features[0].geometry
  await newListing.save();
  req.flash("success", "New listing is created successfully.");
  res.redirect("/listings");
};

module.exports.renderEditListingForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist.");
    res.redirect("/listings");
  }
  let originalImagePath = listing.image.path;
  originalImagePath = originalImagePath.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImagePath });
};

module.exports.editListing = async (req, res, next) => {
  const { id } = req.params;
  const updatedListing = req.body.listing;
  const listing = await Listing.findByIdAndUpdate(id, { ...updatedListing });
  if (typeof req.file !== "undefined") {
    const path = req.file.path;
    const fileName = req.file.filename;
    listing.image = { path, fileName };
  }
  await listing.save();
  req.flash("success", "Listing is updated successfully.");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing is deleted successfully.");
  res.redirect("/listings");
};
