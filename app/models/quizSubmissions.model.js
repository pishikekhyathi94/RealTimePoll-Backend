module.exports = (sequelize, Sequelize) => {
  const quizSubmissions = sequelize.define("quizSubmissions", {
    options: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    },
  });
  return quizSubmissions;
};