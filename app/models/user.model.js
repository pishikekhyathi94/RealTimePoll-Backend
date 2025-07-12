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
      validate: {
        isEmail: true,
        isValidForType(value) {
          if (this.userType === "student" && !value.endsWith("@std.edu")) {
            throw new Error("Student email must end with @stu.edu");
          }
          if (this.userType === "professor" && !value.endsWith("@proff.edu")) {
            throw new Error("Professor email must end with @proff.edu");
          }
        },
      },
    },
    password: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
    salt: {
      type: Sequelize.BLOB,
      allowNull: false,
    },
  });

  return User;
};
