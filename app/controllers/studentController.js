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


exports.finishQuiz = async (req, res) => {
  try {
    if (!req.body.quizId || !req.body.userId) {
      return res
        .status(400)
        .send({ message: "quizId and userId are required!" });
    }
    let userId = req.body.userId;
    let quizId = req.body.quizId;
    let student_quiz_finished = await db.finishQuiz.findOne({
      where: { userId: req.body.userId, quizId: req.body.quizId },
    });
    if (student_quiz_finished) {
      return res.status(400).json("Quiz already attempted");
    }
    const quiz_student = await db.quiz.findOne({
      where: { id: quizId },
    });
    const startTime = quiz_student.start_time;
    if (startTime > new Date()) {
      return res
        .status(400)
        .json({ message: `Quiz will start at ${startTime}` });
    }

    await db.finishQuiz.create({
      userId: userId,
      quizId: quizId,
    });
    const quizdetails = await db.quiz.findOne({
      where: { id: quizId },
      include: [
        {
          model: db.question,
          as: "question",
        },
      ],
    });

    if (!quizdetails) {
      return res.status(404).json({ message: "Quiz does not exists." });
    }

    const now = new Date();
    const completedSeconds = Math.floor((now - startTime) / 1000);
    let cumulativeTime = 0;
    let current_question = null;
    for (const question of quizdetails.question) {
      cumulativeTime += question.timer;
      if (completedSeconds < cumulativeTime) {
        current_question = question;
        break;
      }
    }
    if (!current_question) {
      return res
        .status(400)
        .json({ message: "Quiz closed. Cannot take now", is_closed: true });
    }

    const options = await db.option.findAll({
      where: { questionId: current_question.id },
    });

    return res.status(200).json({
      question: current_question,
      options: options,
      timeLeftForCurrentQuestion: cumulativeTime - completedSeconds,
    });
  } catch (error) {
    console.error("Error starting quiz:", error);
    return res.status(500).send({ message: "Server error." });
  }
};
