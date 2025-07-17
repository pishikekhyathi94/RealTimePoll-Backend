const db = require("../models");
const Class = db.class;

// Create and Save a new Class
exports.create = (req, res) => {
  if (!req.body.name || !req.body.userId) {
    return res.status(400).send({ message: "Name and userId are required!" });
  }
  const newClass = {
    name: req.body.name,
    description: req.body.description,
    userId: req.body.userId
  };
  Class.create(newClass)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Create and Save a new Class for a user
exports.createForUser = (req, res) => {
  const userId = req.params.userId;
  if (!req.body.name) {
    return res.status(400).send({ message: "Name is required!" });
  }
  const newClass = {
    name: req.body.name,
    description: req.body.description,
    userId: userId
  };
  Class.create(newClass)
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Find all Classes for a user (by userId in params)
exports.findAllForUser = (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).send({ message: "userId is required in params." });
  }
  Class.findAll({ where: { userId: userId } })
    .then(data => res.send(data))
    .catch(err => res.status(500).send({ message: err.message }));
};

// Get a single class by id
exports.findOne = (req, res) => {
  const id = req.params.id;
  Class.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `Cannot find Class with id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message || "Error retrieving Class with id=" + id });
    });
};
