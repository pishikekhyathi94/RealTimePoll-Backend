module.exports = (sequelize, Sequelize) => {
  const quizSubmissions = sequelize.define("quizSubmissions", {});
  return quizSubmissions;
};
