const db = require("../models");

exports.registerForClass = (req, res) => {
  if (!req.body.classId || !req.body.userId) {
    return res
      .status(400)
      .send({ message: "classId and userId are required!" });
  }
  const register = {
    classId: req.body.classId,
    userId: req.body.userId,
  };
  db.studentClass
    .create(register)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      console.error("Error registering student for class:", err);

      return res.status(500).send({ message: err.message });
    });
};
exports.submitQuiz = (req, res) => {
  if (!req.body.quizId || !req.body.userId) {
    return res.status(400).send({
      message: "quizId, userId, and question and option are required!",
    });
  }

  let optionIds = req.body.optionId;
  if (Array.isArray(optionIds)) {
    // Already an array, use as is
  } else if (optionIds !== undefined) {
    // Single value, wrap in array
    optionIds = [optionIds];
  } else {
    optionIds = [];
  }

  const submission = {
    quizId: req.body.quizId,
    userId: req.body.userId,
    questionId: req.body.questionId,
    options: optionIds,
  };
  db.quizSubmissions
    .create(submission)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      console.error("Error submitting quiz:", err);
      return res.status(500).send({ message: err.message });
    });
};


exports.finishQuiz = (req, res) => {
  if (!req.body.quizId || !req.body.userId) {
    return res.status(400).send({ message: "quizId and userId are required!" });
  }

  const finish = {
    quizId: req.body.quizId,
    userId: req.body.userId,
  };
  db.finishQuiz
    .create(finish)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      console.error("Error finishing quiz:", err);
      return res.status(500).send({ message: err.message });
    });
};