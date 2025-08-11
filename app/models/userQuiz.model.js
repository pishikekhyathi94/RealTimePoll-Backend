module.exports = (sequelize, Sequelize) => {
  const Quiz = sequelize.define("quiz", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.STRING,
    },
    is_enabled: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
     start_time: {
      type: Sequelize.DATE,
    },
  });

  return Quiz;
};
