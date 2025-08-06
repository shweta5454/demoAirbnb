if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Listing = require("./models/listingsSchema");
const { data } = require("./init/data");
const CustomError = require("./utils/CustomError.js");
const passport = require("passport");
const LocalStategy = require("passport-local");
const User = require("./models/user");

const Review = require("./models/reviewSchema");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/reviews.js");
const userRouter = require("./routes/user.js");
let port = 8080;
// mongoose connection
//const MONGO_URL = "mongodb://127.0.0.1:27017/listings";

const ATLAS_DB = process.env.ATLAS_DB;
main()
  .then(() => {
    console.log("connectd to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(ATLAS_DB);
}

//set ejs engine and  view folder path for server side rendering
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//middlewares

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.engine("ejs", ejsMate);

//flashmessages with session
const store = MongoStore.create({
  mongoUrl: ATLAS_DB,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//route insert many listings into database
app.get("/insertlistings", async (req, res) => {
  let dataWithOwner = data.map((obj) => ({
    ...obj,
    owner: "681756e51e4705cd22aeb9cd",
  }));

  await Listing.insertMany(dataWithOwner)
    .then(() => {
      console.log("hurrey listing inserted successfully!!!");
    })
    .catch((err) => console.log(err));

  res.send("listings inserted successfully");
});

//middleware for displaying error messages using session & flash
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curUser = req.user;
  next();
});

//authentication route
app.get("/demouser", async (req, res) => {
  let fakeuser = new User({
    email: "abcuser@gmail.com",
    username: "abc-user",
  });
  let reguser = await User.register(fakeuser, "123443");
  res.send(reguser);
});

//Routes using express router
app.use("/", listingsRouter);
app.use("/listings", listingsRouter);
app.use("/listings/:id/review", reviewsRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new CustomError(404, "Page Not Found"));
});
app.use((err, req, res, next) => {
  let { status = 500, message = "something went wrong!!!!!!" } = err;
  res.status(status).render("listings/error.ejs", { message });
  // res.status(status).send(message);
});
app.listen(port, () => {
  console.log(`APP STARTED AT PORT NUMBER ${port} `);
});
