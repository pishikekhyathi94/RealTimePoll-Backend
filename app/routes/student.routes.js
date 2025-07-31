module.exports = (app) => {
  const Student = require("../controllers/studentController");
  var router = require("express").Router();

  router.post("/register", Student.registerForClass);

  app.use("/Realtimepoll", router);
};
