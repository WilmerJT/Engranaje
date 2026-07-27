const gearMath = require("./services/gearMath");

const dimensions =
gearMath.calculateDimensions(
    2,
    20,
    20
);

const gear =
gearMath.buildGear(
    dimensions
);

console.log(

gear.gearPoints.length

);