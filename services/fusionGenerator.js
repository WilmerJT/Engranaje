const fs = require('fs');
const path = require('path');

/**
 * Genera el código Python completo para Fusion 360 sustituyendo las variables en la plantilla.
 * @param {Object} gearData - Datos calculados del engranaje
 * @returns {string} Código Python procesado
 */
function generatePythonScript(gearData) {
  const { dimensions } = gearData;
  
  // Ruta a la plantilla de Python
  const templatePath = path.join(__dirname, '../templates/fusionTemplate.py');
  
  // Leer el contenido de la plantilla
  let template = fs.readFileSync(templatePath, 'utf8');

  // Reemplazar marcadores por los valores geométricos
  const faceWidth = dimensions.width || 10; // Valor por defecto 10mm
  const boreDiameter = dimensions.bore || 5;  // Valor por defecto 5mm

  template = template
    .replace('{{MODULE}}', dimensions.mod)
    .replace('{{TEETH}}', dimensions.teeth)
    .replace('{{FACE_WIDTH}}', faceWidth)
    .replace('{{BORE_DIAMETER}}', boreDiameter)
    .replace('{{OUTER_DIAMETER}}', dimensions.outsideDiameter)
    .replace('{{KEYWAY_WIDTH}}', dimensions.keywayWidth || 0)
    .replace('{{KEYWAY_DEPTH}}', dimensions.keywayDepth || 0);
  return template;
}

module.exports = {
  generatePythonScript
};