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


module.exports = { calculateHubAndKeyway };