const db = require("../models");
const { CohereClient } = require("cohere-ai");
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});
const Op = db.Sequelize.Op;

exports.create = async (req, res) => {
  try {
    const userId = req.body.user_id;
    if (!req.body.prompt) {
      res.status(400).send({
        message: "prompt can not be empty!",
      });
    }
    console.log("req", req.body.prompt);
    let prompt_to_ask = `${req.body.prompt}.Format the output as a valid JSON object with the following structure:
    {
  "questions": [
    {
      "question": "Your question here",
      "timer": 90,
      "options": [
        { "option": "Option A" },
        { "option": "Option B", "is_correct": true },
        { "option": "Option C" }
      ]
    }
  ]
}
  return only valid JSON object with the questions array. Do not return any other text or explanation.
  Make sure to include at least one question with multiple options, and mark one of the options as correct by setting "is_correct": true.
    `;
    let response = await cohere.chat({
      message: prompt_to_ask,
    });
    const cleanedText = response.text
      .replace(/^```json/, "")
      .replace(/^```/, "")
      .replace(/```$/, "")
      .trim();

    const parsedJSON = JSON.parse(cleanedText);
    return res.status(200).json(parsedJSON);
  } catch (error) {
    return res.status(500).send({
      message: "An error occurred while creating the recipe.",
    });
  }
};

exports.findAllForUser = (req, res) => {
  const classId = req.params.classId;
  db.quiz
    .findAll({
      where: { classId: classId },
      include: [
        {
          model: db.question,
          as: "question",
          include: [
            {
              model: db.option,
              as: "option",
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    })
    .then(async (data) => {
      if (data) {
        const userId = req.query.userId;
        const quizIds = data.map((quiz) => quiz.id);
        const finishQuizData = await db.finishQuiz.findAll({
          where: {
            quizId: { [Op.in]: quizIds },
            userId: userId,
          },
        });
        const finishedQuizIds = new Set(finishQuizData.map((fq) => fq.quizId));
        data.forEach((quiz) => {
          quiz.dataValues.is_finished = finishedQuizIds.has(quiz.id);
        });
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Recipes for user with id=${userId}.`,
        });
      }
    })
    .catch((err) => {
      console.log("Error retrieving Recipes:", err);
      res.status(500).send({
        message:
          err.message || "Error retrieving Recipes for user with id=" + userId,
      });
    });
};

// Find a single Quiz with an id
exports.findOne = (req, res) => {
  const id = req.params.quizId;
  console.log("Finding quiz with ID:", id);
  db.quiz
    .findOne({
      where: { id: id },
      include: [
        {
          model: db.question,
          as: "question",
          include: [
            {
              model: db.option,
              as: "option",
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    })
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Quiz with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Quiz with id=" + id,
      });
    });
};


exports.delete = (req, res) => {
  const id = req.params.quizId;
  db.quiz
    .destroy({
      where: { id: id },
    })
    .then((num) => {
      if (num === 1) {
        res.send({
          message: "Quiz was deleted successfully!",
        });
      } else {
        res.status(404).send({
          message: `Cannot delete Quiz with id=${id}. Maybe Quiz was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Could not delete Quiz with id=" + id,
      });
    });
};

exports.createManualQuiz = async (req, res) => {
  try {
    const userId = req.body.user_id;
    const classId = req.body.classId;
    const quizName = req.body.title || "Untitled Quiz";
    const quiz = await db.quiz.create({
      classId: classId,
      name: quizName,
      description: req.body.description || "No description provided",
      userId: userId,
      category: req.body.category || "General",
      is_enabled: req.body.is_enabled || false,
      start_time: req.body.start_time || new Date(),
    });
    if (!req.body.questions || req.body.questions.length === 0) {
      return res.status(400).send({
        message: "At least one question is required to create a quiz.",
      });
    }

    for (const questionObj of req.body.questions) {
      const question = await db.question.create({
        quizId: quiz.id,
        name: questionObj.question,
        timer: questionObj.timer || 90,
      });

      for (const optionObj of questionObj.options) {
        await db.option.create({
          questionId: question.id,
          name: optionObj.option,
          correctOption: optionObj.is_correct || false,
        });
      }
    }
    return res.status(200).json({
      message: "Quiz saved successfully",
    });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return res.status(500).send({
      message: "An error occurred while creating the quiz.",
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.quizId;
  try {
    if (!req.body.title || !req.body.description) {
      return res.status(400).send({
        message: "Title, description are required fields.",
      });
    }
    const quiz = await db.quiz.findByPk(id);
    if (!quiz) {
      return res.status(404).send({
        message: `Quiz with id=${id} not found.`,
      });
    }
    quiz.name = req.body.title;
    quiz.description = req.body.description;
    quiz.is_enabled = req.body.is_enabled || false;
    await quiz.save();
    return res.status(200).json({
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return res.status(500).send({
      message: "An error occurred while updating the quiz.",
    });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).send({ message: "No token provided." });
    }
    const questionId = req.body.id;
    if (!questionId) {
      return res.status(400).send({ message: "Question ID is required." });
    }
    const question = req.body.name;
    if (!question || question.trim() === "") {
      return res.status(400).send({ message: "question is required." });
    }
    const options = req.body.options;
    if (!options || options.length < 2) {
      return res
        .status(400)
        .send({ message: "At least two options are required." });
    }

    await db.question.update(
      { name: question, timer: req.body.timer || 60 },
      { where: { id: questionId } }
    );
    const existingOptions = await db.option.findAll({
      where: { questionId: questionId },
    });
    const optionIdsInBody = options.filter((o) => o.id).map((o) => o.id);
    for (const dbOption of existingOptions) {
      if (!optionIdsInBody.includes(dbOption.id)) {
        await db.option.destroy({ where: { id: dbOption.id } });
      }
    }
    for (const option of options) {
      console.log("option", option);
      if (!option.name || option.name.trim() === "") {
        continue;
      }

      if (option.id) {
        console.log("Updating option:", option);
        await db.option.update(
          { name: option.name, correctOption: option.correctOption || false },
          { where: { id: option.id, questionId: questionId } }
        );
      } else {
        console.log("Creating new option:", option);
        await db.option.create({
          name: option.name,
          questionId: questionId,
          correctOption: option.correctOption || false,
        });
      }
    }

    return res.status(200).json("question updated successfully");
  } catch (error) {
    console.error("Error updating quiz question:", error);
    return res.status(500).send({ message: "Server error." });
  }
};

exports.deleteQuestion = async (req, res) => {
  const questionId = req.params.questionId;
  try {
    const question = await db.question.findByPk(questionId);
    if (!question) {
      return res.status(404).send({
        message: `Question with id=${questionId} not found.`,
      });
    }
    await db.option.destroy({
      where: { questionId: question.id },
    });
    await question.destroy();
    return res.status(200).json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return res.status(500).send({
      message: "An error occurred while deleting the question.",
    });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const quizId = req.body.quizId;
    const questionText = req.body.question;
    const timer = req.body.timer || 90;
    const options = req.body.options || [];

    if (!quizId || !questionText || options.length === 0) {
      return res.status(400).send({
        message: "quizId, question, and options are required fields.",
      });
    }

    const question = await db.question.create({
      quizId: quizId,
      name: questionText,
      timer: timer,
    });

    for (const option of options) {
      await db.option.create({
        questionId: question.id,
        name: option.option,
        correctOption: option.is_correct || false,
      });
    }

    return res.status(200).json({
      message: "Question added successfully",
    });
  } catch (error) {
    console.error("Error adding question:", error);
    return res.status(500).send({
      message: "An error occurred while adding the question.",
    });
  }
};

exports.updateQuizType = async (req, res) => {
  try {
    const quizId = req.body.quizId;
    const quizType = req.body.quizType;

    if (!quizId || quizType === undefined) {
      return res.status(400).send({
        message: "quizId and quizType are required fields.",
      });
    }

    await db.quiz.update({ is_enabled: quizType }, { where: { id: quizId } });
    return res.status(200).json({
      message: "Quiz type updated successfully",
    });
  } catch (error) {
    console.error("Error updating quiz type:", error);
    return res.status(500).send({
      message: "An error occurred while updating the quiz type.",
    });
  }
};

exports.getQuizReport = async (req, res) => {
  const quizId = req.params.quizId;
  try {
    const submissions = await db.quizSubmissions.findAll({
      where: { quizId: quizId },
      include: [
        {
          model: db.user,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });
    if (!submissions || submissions.length === 0) {
      return res.status(404).send({
        message: `No submissions found for quiz with id=${quizId}.`,
      });
    }
    if (req.query.userId) {
      const userId = req.query.userId;
      const userSubmissions = submissions.filter(
        (sub) => sub.user && sub.user.id == userId
      );
      const questionIds = userSubmissions.map((sub) => sub.questionId);
      const questions = await db.question.findAll({
        where: { id: { [Op.in]: questionIds } },
        include: [
          {
            model: db.option,
            as: "option",
          },
        ],
      });
      const questionMap = new Map();
      questions.forEach((q) => questionMap.set(q.id, q));

      const report = {
        user: userSubmissions[0]?.user
          ? {
              id: userSubmissions[0].user.id,
              firstName: userSubmissions[0].user.firstName,
              lastName: userSubmissions[0].user.lastName,
              email: userSubmissions[0].user.email,
            }
          : null,
        questions: [],
      };

      userSubmissions.forEach((submission) => {
        const question = questionMap.get(submission.questionId);
        let selectedOptionIds = [];
        try {
          selectedOptionIds = JSON.parse(submission.options);
        } catch (e) {
          selectedOptionIds = [];
        }
        let options = [];
        if (question && question.option) {
          options = question.option.map((opt) => ({
            ...opt.dataValues,
            user_selected: selectedOptionIds.includes(opt.id),
          }));
        }
        report.questions.push({
          questionId: submission.questionId,
          question: question ? question.name : null,
          options: options,
        });
      });

      const quiz = await db.quiz.findOne({
        where: { id: quizId },
        include: [
          {
            model: db.class,
            as: "class",
          },
        ],
      });

      let class_details = null;
      let quiz_details = null;

      if (quiz) {
        quiz_details = {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          category: quiz.category,
          is_enabled: quiz.is_enabled,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
        };
        if (quiz.class) {
          class_details = {
            id: quiz.class.id,
            name: quiz.class.name,
            description: quiz.class.description,
            createdAt: quiz.class.createdAt,
            updatedAt: quiz.class.updatedAt,
          };
        }
      }
      report.class_details = class_details;
      report.quiz_details = quiz_details;
      return res.status(200).json({ report });
    } else {
      const userMap = new Map();
      submissions.forEach((submission) => {
        const user = submission.user;
        if (user && !userMap.has(user.id)) {
          userMap.set(user.id, {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            questions: [],
          });
        }
      });
      const reports = Array.from(userMap.values());
      const questionIds = submissions.map((sub) => sub.questionId);
      const questions = await db.question.findAll({
        where: { id: { [Op.in]: questionIds } },
        include: [
          {
            model: db.option,
            as: "option",
          },
        ],
      });
      const questionMap = new Map();
      questions.forEach((q) => questionMap.set(q.id, q));

      submissions.forEach((submission) => {
        if (submission.user && userMap.has(submission.user.id)) {
          const user = userMap.get(submission.user.id);
          const question = questionMap.get(submission.questionId);
          let selectedOptionIds = [];
          try {
            selectedOptionIds = JSON.parse(submission.options);
          } catch (e) {
            selectedOptionIds = [];
          }
          const selectedOptions =
            question && question.option
              ? question.option.filter((opt) =>
                  selectedOptionIds.includes(opt.id)
                )
              : [];
          if (question && question.option) {
            question.option = question.option.map((opt) => ({
              ...opt.dataValues,
              user_selected: selectedOptionIds.includes(opt.id),
            }));
          }
          user.questions.push({
            questionId: submission.questionId,
            question: question ? question.name : null,
            options: question ? question.option : [],
          });

          userMap.set(user.id, user);
        }
      });
      const quiz = await db.quiz.findOne({
        where: { id: quizId },
        include: [
          {
            model: db.class,
            as: "class",
          },
        ],
      });

      let class_details = null;
      let quiz_details = null;

      if (quiz) {
        quiz_details = {
          id: quiz.id,
          name: quiz.name,
          description: quiz.description,
          category: quiz.category,
          is_enabled: quiz.is_enabled,
          createdAt: quiz.createdAt,
          updatedAt: quiz.updatedAt,
        };
        if (quiz.class) {
          class_details = {
            id: quiz.class.id,
            name: quiz.class.name,
            description: quiz.class.description,
            createdAt: quiz.class.createdAt,
            updatedAt: quiz.class.updatedAt,
          };
        }
      }
      reports.forEach((report) => {
        report.class_details = class_details;
        report.quiz_details = quiz_details;
      });
      return res.status(200).json({ reports });
    }
  } catch (error) {
    return res.status(500).send({
      message: "An error occurred while retrieving the quiz report.",
    });
  }
};