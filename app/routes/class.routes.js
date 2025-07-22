module.exports = (app) => {
  const classes = require("../controllers/class.controller.js");
  var router = require("express").Router();
    const { authenticateRoute } = require("../authentication/authentication.js");
  router.post("/classes",authenticateRoute, classes.create);
 router.get("/classes/user/:userId",authenticateRoute, classes.findAllForUser);

  router.get("/classes/:id", classes.findOne);

  app.use("/Realtimepoll", router);
};
