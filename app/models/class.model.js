module.exports = (sequelize, Sequelize) => {
  const Class = sequelize.define("class", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
    }
    
  });

  return Class;
};
