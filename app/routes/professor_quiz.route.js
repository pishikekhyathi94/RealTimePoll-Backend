module.exports = (app) => {
  const quiz = require("../controllers/professor_quiz.controller.js");
  const { authenticateRoute } = require("../authentication/authentication.js");
  var router = require("express").Router();

  // Create a new Recipe
  router.post("/quiz", quiz.create);
  router.get("/quiz/all/:classId", quiz.findAllForUser);
  router.get("/quiz/:quizId", quiz.findOne);
  router.delete("/quiz/:quizId", quiz.delete);
  router.post("/manual/quiz", quiz.createManualQuiz);
  router.put("/quiz/:quizId", quiz.update);
  router.put("/update/question", quiz.updateQuestion);
  router.delete("/delete/question/:questionId", quiz.deleteQuestion);
  router.post("/add/question", quiz.addQuestion);
    router.put("/update/quiz/type", quiz.updateQuizType);

  app.use("/Realtimepoll", router);
};
