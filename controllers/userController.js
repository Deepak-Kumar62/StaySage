const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
  res.render("user/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body.user;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    if (registeredUser) {
      req.logIn(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash("success", "Welcome to WonderLust.");
        res.redirect("/listings");
      });
    }
  } catch (error) {
    req.flash("error", error.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res, next) => {
  res.render("user/login.ejs");
};

module.exports.login = (req, res, next) => {
  req.flash("success", "Welcome back to WonderLust.");
  res.redirect("/listings");
};

module.exports.logOut = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(err);
    }
    req.flash("success", "You are logged out successfully.");
    res.redirect("/listings");
  });
};
