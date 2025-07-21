module.exports = (app) => {
  const classes = require("../controllers/class.controller.js");
  var router = require("express").Router();

  router.post("/classes", classes.create);

  app.use("/Realtimepoll", router);
};
