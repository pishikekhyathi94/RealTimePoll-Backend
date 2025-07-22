module.exports = (sequelize, Sequelize) => {
  const Option = sequelize.define("options", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    correctOption: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  return Option;
};
