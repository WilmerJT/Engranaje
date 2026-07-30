const express = require("express");
const router = express.Router();

const gearController = require("../controllers/gearController");
const verifyToken = require('../middlewares/authMiddleware');

// Vista previa
router.post("/preview", gearController.preview);

// Generar script Fusion
router.post("/generate-script", verifyToken, gearController.generateScript);

module.exports = router;