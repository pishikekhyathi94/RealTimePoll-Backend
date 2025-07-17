const { saltSize, keySize } = require("../authentication/crypto");

module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
          },
    password: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
     roles: {
      type: Sequelize.JSON, 
      allowNull: false,
      defaultValue: ["student"], // You can default to any role
    },
    salt: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
    
  });

  return User;
};
