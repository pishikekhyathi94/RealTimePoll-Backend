const db = require("../models");
const { CohereClient } = require("cohere-ai");
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

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
    .then((data) => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Quizs for user with id=${userId}.`,
        });
      }
    })
    .catch((err) => {
      console.log("Error retrieving Quizs:", err);
      res.status(500).send({
        message:
          err.message || "Error retrieving Quizs for user with id=" + userId,
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
    const question = await db.question.findByPk(req.body.id);
    if (!question) {
      return res.status(404).send({
        message: `Question with id=${questionId} not found.`,
      });
    }
    question.name = req.body.name;
    question.timer = req.body.timer || 90; 
    await question.save();
    let existingOptions = await db.option.findAll({
      where: { questionId: question.id },
    });
    const existingOptionNames = existingOptions.map((opt) => opt.name);
    const newOptions = req.body.options || [];
    const optionsToDelete = existingOptions.filter(
      (opt) => !newOptions.some((newOpt) => newOpt.name === opt.name)
    );
    console.log("Options to delete:", optionsToDelete);
    await db.option.destroy({
      where: {
        id: optionsToDelete.map((opt) => opt.id),
      },
    });
    for (const option of newOptions) {
      if (existingOptionNames.includes(option.name)) {
        const existingOption = existingOptions.find(
          (opt) => opt.name === option.name
        );
        console.log("Updating existing option:", existingOption);
        existingOption.correctOption = option.is_correct || false;
        await existingOption.save();
      } else {
        console.log("Creating new option:", option);
        await db.option.create({
          questionId: question.id,
          name: option.name,
          correctOption: option.is_correct || false,
        });
      }
    }
    return res.status(200).json({
      message: "Question updated successfully",
    });
  } catch (error) {
    console.error("Error updating question:", error);
    return res.status(500).send({
      message: "An error occurred while updating the question.",
    });
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