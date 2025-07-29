const db = require("../models");
const Class = db.class;

exports.create = (req, res) => {
  if (!req.body.name || !req.body.userId) {
    return res.status(400).send({ message: "Name and userId are required!" });
  }
  const newClass = {
    name: req.body.name,
    description: req.body.description,
    userId: req.body.userId,
  };
  Class.create(newClass)
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).send({ message: "userId is required in params." });
  }
  Class.findAll({ where: { userId: userId } })
    .then((data) => res.send(data))
    .catch((err) => res.status(500).send({ message: err.message }));
};

  exports.findOne = (req, res) => {
    const id = req.params.id;
    Class.findByPk(id)
      .then((data) => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({ message: `Cannot find Class with id=${id}.` });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: err.message || "Error retrieving Class with id=" + id,
        });
      });
  };

  exports.findOneAndUpdate = (req, res) => {
  const id = req.params.id;
  Class.update(req.body, { where: { id: id } })
    .then((num) => {
      res.send({ message: "Class was updated successfully." });
    })

    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Class with id=" + id,
      });
    });
};

exports.deleteOne = (req, res) => {
  const id = req.params.id;
  Class.destroy({ where: { id: id } })
    .then((num) => {
      res.send({ message: "Class was deleted successfully!" });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error retrieving Class with id=" + id,
      });
    });
};

exports.findAllClasses = async (req, res) => {
  let classes = await Class.findAll();
  const userId = req.query.userId;
  if (userId) {
    const StudentClass = db.studentClass;
    const studentClasses = await StudentClass.findAll({ where: { userId } });
    const registeredClassIds = new Set(studentClasses.map((sc) => sc.classId));
    classes = classes.map((cls) => ({
      ...cls.toJSON(),
      isRegistered: registeredClassIds.has(cls.id),
    }));
  }
  return res.status(200).json(classes);
};
