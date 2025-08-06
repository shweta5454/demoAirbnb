const User = require("../models/user.js");

//signUp form
module.exports.signUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

//signUp
module.exports.signUp = async (req, res, next) => {
  try {
    let { username, password, email } = req.body;
    const newuser = new User({ email, username });
    const reguser = await User.register(newuser, password);
    req.login(reguser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

//loginform
module.exports.loginForm = (req, res) => {
  res.render("users/login.ejs");
};

//login
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back! You are logged in.");
  res.redirect(res.locals.redirecturl || "/listings");
};

//logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
