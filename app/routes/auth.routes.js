module.exports = (app) => {
  const auth = require("../controllers/auth.controller.js");

  var router = require("express").Router();

  // Login
  router.post("/users/login", auth.login);

  // Logout
  router.post("/logout", auth.logout);

  app.use("/Realtimepoll", router);

};
