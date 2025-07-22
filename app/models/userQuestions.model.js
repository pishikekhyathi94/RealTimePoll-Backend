module.exports = (sequelize, Sequelize) => {
  const Question = sequelize.define("questions", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    timer: {
      type: Sequelize.INTEGER,
      defaultValue: 30,
    },
  });

  return Question;
};
