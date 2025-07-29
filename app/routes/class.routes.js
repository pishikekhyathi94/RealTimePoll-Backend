module.exports = (app) => {
  const classes = require("../controllers/class.controller.js");
  var router = require("express").Router();
    const { authenticateRoute } = require("../authentication/authentication.js");
  router.post("/classes",authenticateRoute, classes.create);
 router.get("/classes/user/:userId",authenticateRoute, classes.findAllForUser);

  router.get("/classes/:id", classes.findOne);
  router.put("/classes/:id", classes.findOneAndUpdate);
  router.delete("/classes/:id", classes.deleteOne);
  router.get("/all/classes", classes.findAllClasses);

  app.use("/Realtimepoll", router);
};
