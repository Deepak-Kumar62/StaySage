if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");
const ExpressError = require("./utilities/expressError.js");

const listingRoute = require("./router/listing.js");
const reviewRoute = require("./router/review.js");
const userRoute = require("./router/user.js");

//This package is used for creating the template or layout
const ejsMate = require("ejs-mate");
const { error } = require("console");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//To encode the url
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

//To use static file like public folder
app.use(express.static(path.join(__dirname, "/public")));

const ATLASDB_URL = process.env.ATLASDB_URL;

// Database Connection
async function main() {
  await mongoose.connect(ATLASDB_URL);
}

main()
  .then(() => {
    console.log("Database Connected.");
  })
  .catch((error) => {
    console.log("Database is not connected.");
    console.log(error);
  });

const store = MongoStore.create({
  mongoUrl: ATLASDB_URL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (error) => {
  console.log("Error in mongo session store", error)
})

const sessionOption = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.successMessage = req.flash("success");
  res.locals.errorMessage = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

app.use(userRoute);
app.use("/listings", listingRoute);
app.use("/listings/:id/review", reviewRoute);

app.get("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

//Global Error handler middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Error" } = err;
  res.render("listings/error.ejs", { message, status });
});

// Starting server at port 8000
app.listen(8000, () => {
  console.log("Server is listening.");
});
