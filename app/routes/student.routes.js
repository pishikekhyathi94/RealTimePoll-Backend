module.exports = (app) => {
  const Student = require("../controllers/studentController");
  var router = require("express").Router();

  router.post("/register", Student.registerForClass);
  router.post("/start/quiz", Student.submitQuiz);
  router.post("/finish/quiz", Student.finishQuiz);

  app.use("/Realtimepoll", router);
};
