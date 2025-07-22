module.exports = (sequelize, Sequelize) => {
  const Quiz = sequelize.define("quiz", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
  });

  return Quiz;
};
