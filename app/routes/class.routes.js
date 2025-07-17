module.exports = app => {
  const classes = require("../controllers/class.controller.js");
  var router = require("express").Router();

  // Create a new class
  router.post("/classes", classes.create);

  // Get all classes for a specific user
  router.get("/classes/user/:userId", classes.findAllForUser);

  // Get a single class by id
  router.get("/classes/:id", classes.findOne);

  app.use("/Realtimepoll", router);
};
