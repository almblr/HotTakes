const Sauce = require("../models/saucesModels.js");
const User = require("../models/usersModels.js");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`, // req.protocole pour http(s)
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée !" }))
    .catch((error) => {
      res.status(error.statusCode).json({
        message: "Il y a eu une erreur lors de la création de votre sauce.",
      });
    });
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      console.log(error);
      res.status(error.statusCode).json({
        message: "Sauce introuvable.",
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée !" }))
    .catch((error) => {
      res.status(error.statusCode).json({
        message: "Il y a eu une erreur lors de la modification de votre sauce.",
      });
    });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (req.auth.userId !== sauce.userId) {
        return res
          .status(401)
          .json({ message: "vous ne pouvez pas modifier cette sauce" });
      }
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => {
            res.status(error.statusCode).json({
              message:
                "Il y a eu une erreur lors de la suppression de votre sauce.",
            });
          });
      });
    })
    .catch((error) => {
      res.status(error.statusCode).json({
        message: "Une erreur est survenue.",
      });
    });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(error.statusCode).json({
        message: "Une erreur est survenue.",
      });
    });
};

exports.checkScore = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .catch((error) => {
      res.status(error.statusCode).json({
        message: "Une erreur est survenue.",
      });
    })
    .then((sauce) => {
      switch (req.body.like) {
        case 1: // pouce vert
          if (
            sauce.usersLiked.includes(req.body.userId) ||
            sauce.usersDisliked.includes(req.body.userId)
          ) {
            res.status(409).json({
              message: "Vous avez déjà laissé un avis sur cette sauce.",
            });
          } else {
            sauce.likes++;
            sauce.usersLiked.push(req.body.userId);
            sauce.save();
            res.status(200).json(sauce);
          }
          break;
        case -1: // pouce rouge
          if (
            sauce.usersLiked.includes(req.body.userId) ||
            sauce.usersDisliked.includes(req.body.userId)
          ) {
            res.status(409).json({
              message: "Vous avez déjà laissé un avis sur cette sauce.",
            });
          } else {
            sauce.dislikes++;
            sauce.usersDisliked.push(req.body.userId);
            sauce.save();
            res.status(200).json(sauce);
          }
          break;
        case 0:
          if (sauce.usersLiked.includes(req.body.userId)) {
            index = sauce.usersLiked.indexOf(req.body.userId);
            sauce.usersLiked.splice(index, 1);
            sauce.likes--;
          }
          if (sauce.usersDisliked.includes(req.body.userId)) {
            index = sauce.usersDisliked.indexOf(req.body.userId);
            sauce.usersDisliked.splice(index, 1);
            sauce.dislikes--;
          }
          sauce.save();
          res.status(200).json(sauce);
          break;
      }
    });
};
