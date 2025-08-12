require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const http = require("http");

const db = require("./app/models");
const server = http.createServer(app);

const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8081",
  },
});
db.sequelize.sync();

app.use(cors());
app.options("*", cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log(new Date(), " - GET /");
  res.json({ message: "Welcome to the recipe backend." });
});

require("./app/routes/auth.routes.js")(app);
require("./app/routes/professor_quiz.route.js")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/class.routes")(app);
require("./app/routes/student.routes.js")(app);

io.on("connect", (socket) => {
  socket.on("participateQuiz", (quizId) => {
    socket.join(`quiz-${quizId}`);
  });

  socket.on("answerSubmission", (data) => {
    const { quizId, questionId, option, studentId } = data;

    io.to(`quiz-${quizId}`).emit("newAnswerSubmission", {
      quizId,
      questionId,
      option,
      studentId,
      timestamp: new Date(),
    });

  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;
if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log('Server is running on port ${PORT}.');
  });
}

module.exports = app;