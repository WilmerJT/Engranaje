const gearMath = require("./services/gearMath");

const dimensions = gearMath.calculateDimensions(2, 20);

const tooth = gearMath.buildTooth(dimensions);

console.log("Left first :", tooth.leftSide[0]);
console.log("Left last  :", tooth.leftSide[tooth.leftSide.length - 1]);

console.log("Right first:", tooth.rightSide[0]);
console.log("Right last :", tooth.rightSide[tooth.rightSide.length - 1]);