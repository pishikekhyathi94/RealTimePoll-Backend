module.exports = app => {
  const classes = require("../controllers/class.controller.js");
  var router = require("express").Router();

  // Creating a new class
  router.post("/classes", classes.create);

  // Get all classes by using userid
  router.get("/classes/userid", classes.findAllForUser);

  app.use("/Realtimepoll", router);
};
