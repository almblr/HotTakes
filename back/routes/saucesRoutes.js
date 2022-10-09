const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const saucesCtrl = require("../controllers/saucesControllers.js");
const multer = require("../middleware/multer-config.js");

router.post("/", auth, multer, saucesCtrl.createSauce); // multer après auth sinon on peut modifier le fichier sans être authentifié
router.get("/", auth, saucesCtrl.getAllSauces);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);
router.post("/:id/like", auth, saucesCtrl.checkScore);

module.exports = router;
