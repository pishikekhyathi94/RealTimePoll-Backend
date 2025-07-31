module.exports = (sequelize, Sequelize) => {
  const studentClass = sequelize.define("studentClass", {});

  return studentClass;
};
