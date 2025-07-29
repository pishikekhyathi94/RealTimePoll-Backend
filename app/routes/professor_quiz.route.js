module.exports = (app) => {
  const quiz = require("../controllers/professor_quiz.controller.js");
  const { authenticateRoute } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // Create a new Recipe
  router.post("/quiz", quiz.create);
  router.get("/quiz/all/:classId", quiz.findAllForUser);
  router.get("/quiz/:quizId", quiz.findOne);
  router.delete("/quiz/:quizId", quiz.delete);

  app.use("/Realtimepoll", router);
};
