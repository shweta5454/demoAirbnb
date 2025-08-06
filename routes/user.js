const express = require("express");
const passport = require("passport");
const router = express.Router();
const wrapasync = require("../utils/Wrapasync.js");
const User = require("../models/user.js");
const { saveRedirectUrl } = require("../middlewares.js");
const userController = require("../controllers/userController.js");

//signupform & signUp route get
router
  .route("/signup")
  .get(userController.signUpForm)
  .post(wrapasync(userController.signUp));

//user loginform & login route
router.route("/login")
  .get(userController.loginForm)
  .post(saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

//logout
router.get("/logout", userController.logout);

module.exports = router;
