const express = require("express");
const passport = require("passport");
const {
  renderSignupForm,
  signup,
  renderLoginForm,
  login,
  logOut,
} = require("../controllers/userController");
const router = express.Router();

router.route("/signup").get(renderSignupForm).post(signup);

router
  .route("/login")
  .get(renderLoginForm)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    login
  );

router.get("/logout", logOut);

module.exports = router;
