/**
 * Calcula la geometría 3D y elementos mecánicos adicionales (Maza y Chavetero)
 */
function calculateHubAndKeyway(boreDiameter) {
  const dEje = parseFloat(boreDiameter) || 0;

  if (dEje <= 0) {
    return { hubDiameter: 0, keywayWidth: 0, keywayDepth: 0 };
  }

  // Fórmulas de taller (A.L. Casillas)
  const hubDiameter = 1.6 * dEje;       // Diámetro exterior de la maza (Dm)
  const keywayWidth = dEje / 4;         // Ancho de la chaveta (b)
  const keywayDepth = 0.6 * keywayWidth; // Profundidad de la chaveta (t2)

  return {
    hubDiameter,
    keywayWidth,
    keywayDepth
  };
}

// Extensión para integrar en el buildGear principal
function buildGear(params) {
  // ... (Tus cálculos de diámetro primitivo, exterior, etc.)
  
  const bore = parseFloat(params.bore) || 12; // Diámetro de eje por defecto 12mm
  const width = parseFloat(params.width) || 15; // Grosor/ancho de cara
  
  const hubAndKeyway = calculateHubAndKeyway(bore);

  return {
    dimensions: {
      module: parseFloat(params.module) || 2,
      teeth: parseInt(params.teeth) || 20,
      pressureAngle: parseFloat(params.pressureAngle) || 20,
      outerDiameter: (parseFloat(params.module) || 2) * ((parseInt(params.teeth) || 20) + 2),
      width,
      bore,
      ...hubAndKeyway
    }
  };
}

module.exports = { buildGear, calculateHubAndKeyway };