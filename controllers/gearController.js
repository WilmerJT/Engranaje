exports.preview = (req, res) => {

    res.status(200).json({
        success: true,
        message: "Endpoint preview funcionando"
    });

};

const gearMath = require('../services/gearMath');
const fusionGenerator = require('../services/fusionGenerator');

// POST /api/generate-script
exports.generateScript = (req, res) => {
  try {
    // 1. Calculamos las dimensiones geométricas reales
    const gearData = gearMath.buildGear(req.body);

    // 2. Inyectamos los datos en la plantilla de Python
    const pythonScript = fusionGenerator.generatePythonScript(gearData);

    // 3. Enviamos el archivo .py como respuesta
    res.setHeader('Content-Type', 'text/x-python');
    res.setHeader('Content-Disposition', 'attachment; filename="gear_generator.py"');
    
    res.send(pythonScript);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generando el script', error: error.message });
  }
};