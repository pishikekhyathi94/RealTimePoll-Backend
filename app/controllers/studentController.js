const db = require("../models");

exports.registerForClass = (req, res) => {
  if (!req.body.classId || !req.body.userId) {
    return res
      .status(400)
      .send({ message: "classId and userId are required!" });
  }
  const register = {
    classId: req.body.classId,
    userId: req.body.userId,
  };
  db.studentClass
    .create(register)
    .then((data) => res.status(200).json(data))
    .catch((err) => {
      console.error("Error registering student for class:", err);

      return res.status(500).send({ message: err.message });
    });
};
