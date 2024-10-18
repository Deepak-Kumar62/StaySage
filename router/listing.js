const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilities/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const {
  index,
  renderNewListingForm,
  showListing,
  createListing,
  renderEditListingForm,
  editListing,
  destroyListing,
} = require("../controllers/listingController.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// isbale route ko listings/:id bale route se uper rakhna hoga taki new ko id samjhkar error na dede
router.get("/new", isLoggedIn, renderNewListingForm);
router
  .route("/")
  .get(wrapAsync(index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(createListing)
  );

router
  .route("/:id")
  .get(wrapAsync(showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(editListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(destroyListing));

router.get("/:id/edit", isOwner, isLoggedIn, wrapAsync(renderEditListingForm));


module.exports = router;
