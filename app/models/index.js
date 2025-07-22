const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.session = require("./session.model.js")(sequelize, Sequelize);
db.user = require("./user.model.js")(sequelize, Sequelize);
db.class = require("./class.model.js")(sequelize, Sequelize);
db.quiz = require("./userQuiz.model.js")(sequelize, Sequelize);
db.question = require("./userQuestions.model.js")(sequelize, Sequelize);
db.option = require("./userOptions.model.js")(sequelize, Sequelize);
// foreign key for session
db.user.hasMany(
  db.session,
  { as: "session" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.session.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

db.user.hasMany(
  db.class,
  { as: "class" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.class.belongsTo(
  db.user,
  { as: "user" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

db.class.hasMany(
  db.quiz,
  { as: "quiz" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.quiz.belongsTo(
  db.class,
  { as: "class" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

db.quiz.hasMany(
  db.question,
  { as: "question" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.question.belongsTo(
  db.quiz,
  { as: "quiz" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

db.question.hasMany(
  db.option,
  { as: "option" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);
db.option.belongsTo(
  db.question,
  { as: "question" },
  { foreignKey: { allowNull: false }, onDelete: "CASCADE" }
);

module.exports = db;
