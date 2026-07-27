function calculateDimensions(module, teeth, pressureAngle = 20) {

    const alpha = pressureAngle * Math.PI / 180;

    const pitchDiameter = module * teeth;
    const pitchRadius = pitchDiameter / 2;

    const outsideDiameter = module * (teeth + 2);
    const outsideRadius = outsideDiameter / 2;

    const rootDiameter = module * (teeth - 2.5);
    const rootRadius = rootDiameter / 2;

    const baseDiameter = pitchDiameter * Math.cos(alpha);
    const baseRadius = baseDiameter / 2;

    const circularPitch = Math.PI * module;
    const toothThickness = circularPitch / 2;
    const toothAngle = toothThickness / pitchRadius;

    const addendum = module;
    const dedendum = 1.25 * module;
    const wholeDepth = addendum + dedendum;

    return {
        module,
        teeth,
        pressureAngle,
        toothAngle,
        pitchDiameter,
        pitchRadius,
        outsideDiameter,
        outsideRadius,
        rootDiameter,
        rootRadius,
        baseDiameter,
        baseRadius,
        circularPitch,
        toothThickness,
        addendum,
        dedendum,
        wholeDepth
    };
}


function involutePoint(baseRadius, t) {

    const x = baseRadius * (
        Math.cos(t) + t * Math.sin(t)
    );

    const y = baseRadius * (
        Math.sin(t) - t * Math.cos(t)
    );

    return {
        x,
        y
    };

}

function generateInvolute(baseRadius, outsideRadius, steps = 30) {

    const points = [];

    const tMax = Math.sqrt(
        Math.pow(outsideRadius / baseRadius, 2) - 1
    );

    for (let i = 0; i <= steps; i++) {

        const t = (tMax * i) / steps;

        points.push(
            involutePoint(baseRadius, t)
        );

    }

    return points;

}

function rotatePoint(point, angle) {

    const x = point.x * Math.cos(angle) -
              point.y * Math.sin(angle);

    const y = point.x * Math.sin(angle) +
              point.y * Math.cos(angle);

    return { x, y };

}

function rotateCurve(points, angle) {

    return points.map(point =>
        rotatePoint(point, angle)
    );

}

function buildToothSides(dimensions){

    const leftSide =
        generateInvolute(
            dimensions.baseRadius,
            dimensions.outsideRadius
        );

    const rightSide =
        rotateCurve(
            leftSide,
            dimensions.toothAngle
        );

    return {

        leftSide,

        rightSide

    };

}

function mirrorInvolute(){}

function buildTooth(dimensions) {

    const { leftSide, rightSide } =
        buildToothSides(dimensions);

    const rightReversed =
        [...rightSide].reverse();

    return [

        ...leftSide,

        ...rightReversed

    ];

}

function rotateTooth(toothPoints, angle) {

    return toothPoints.map(point =>
        rotatePoint(point, angle)
    );

}

function buildGear(dimensions) {

    const tooth =
        buildTooth(dimensions);

    const stepAngle =
        2 * Math.PI / dimensions.teeth;

    const gearPoints = [];

    for(let i=0;i<dimensions.teeth;i++){

        const angle =
            i * stepAngle;

        const rotated =
            rotateTooth(
                tooth,
                angle
            );

        gearPoints.push(...rotated);

    }

    return {

        dimensions,

        toothPoints: tooth,

        gearPoints

    };

}

function calculateAngles(dimensions){
    const pitchAngle = 2*Math.PI/dimensions.teeth;
    const halfToothAngle = dimensions.toothAngle/2;
    const gapAngle = pitchAngle-dimensions.toothAngle;

    return{

        pitchAngle, 

        halfToothAngle,

        gapAngle

    };

}

function rotateCurveAroundOrigin(curve,angle){

    return curve.map(point=>rotatePoint(point,angle));

}

function positionInvolute(curve,dimensions){ 

    const angles = calculateAngles(dimensions);
    const positioned = rotateCurveAroundOrigin(curve,-angles.halfToothAngle);

    return positioned;

}

function mirrorCurve(curve){

    return curve.map(p=>({x:p.x,y:-p.y}));

}



module.exports = {

    calculateDimensions,

    involutePoint,

    generateInvolute,

    rotatePoint,

    rotateCurve,

    rotateTooth,

    mirrorInvolute,

    buildToothSides,

    buildTooth,

    buildGear,

    calculateAngles,

    rotateCurveAroundOrigin,

    positionInvolute,

    mirrorCurve


};