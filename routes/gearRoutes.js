const express = require("express");
const router = express.Router();

const gearController = require("../controllers/gearController");

// Vista previa
router.post("/preview", gearController.preview);

// Generar script Fusion
router.post("/generate-script", gearController.generateScript);

module.exports = router;