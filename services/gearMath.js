
function calculateDimensions(mod, teeth, pressureAngle = 20) {

    const alpha = pressureAngle * Math.PI / 180;

    const pitchDiameter = mod * teeth;
    const pitchRadius = pitchDiameter / 2;

    const outsideDiameter = mod * (teeth + 2);
    const outsideRadius = outsideDiameter / 2;

    const rootDiameter = mod * (teeth - 2.5);
    const rootRadius = rootDiameter / 2;

    const baseDiameter = pitchDiameter * Math.cos(alpha);
    const baseRadius = baseDiameter / 2;

    const circularPitch = Math.PI * mod;
    const toothThickness = circularPitch / 2;
    const toothAngle = toothThickness / pitchRadius;

    const addendum = mod;
    const dedendum = 1.25 * mod;

    

    return {
        module:mod,
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
    };
}


function involutePoint(baseRadius, t) {

    const x = baseRadius * (Math.cos(t) + t * Math.sin(t));

    const y = baseRadius * (Math.sin(t) - t * Math.cos(t));

    return {
        x,y
    };

}

function generateInvolute(baseRadius, outsideRadius, steps = 120) {

    const points = [];

    const tMax = Math.sqrt(Math.pow(outsideRadius / baseRadius, 2) - 1);

    for (let i = 0; i <= steps; i++) {

        const t = (tMax * i) / steps;

        points.push(involutePoint(baseRadius, t));

    }

    return points;

}

function rotatePoint(point, angle) {

    const x = point.x * Math.cos(angle) - point.y * Math.sin(angle);

    const y = point.x * Math.sin(angle) + point.y * Math.cos(angle);

    return { x, y };

}

function rotateCurve(points, angle) {

    return points.map(point => rotatePoint(point, angle));

}


function buildTooth(dimensions){

    const involute = generateInvolute(

        dimensions.baseRadius,

        dimensions.outsideRadius

    );

    const leftSide = positionInvolute(

        involute,

        dimensions

    );

    const rightSide =
    buildOppositeInvolute(
        leftSide,
        dimensions
    );

    const tipArc = generateTipArc(

        leftSide[leftSide.length - 1],

        rightSide[0],

        dimensions.outsideRadius

    );

    console.log(
    "Left angle :",
    pointAngle(leftSide[leftSide.length-1])
    );

    console.log(
        "Right angle:",
        pointAngle(rightSide[0])
    );

    return {

        leftSide,

        tipArc,

        rightSide

    };

}


function buildGear(dimensions){

    return{

        dimensions,

        gearPoints:

            buildGearOutline(dimensions)

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

function positionInvolute(curve, dimensions){

    const angles = calculateAngles(dimensions);

    return rotateCurve(curve,-angles.halfToothAngle);

}

function buildOppositeInvolute(leftCurve){

    return leftCurve
        .map(p=>({

            x:p.x,

            y:-p.y

        }))
        .reverse();

}

function generateArc(radius, startAngle, endAngle, steps = 12) {

    const points = [];

    for (let i = 0; i <= steps; i++) {

        const angle =
            startAngle +
            (endAngle - startAngle) * i / steps;

        points.push({

            x: radius * Math.cos(angle),

            y: radius * Math.sin(angle)

        });

    }

    return points;

}

function generateTipArc(leftPoint, rightPoint, radius, steps = 30){

    let start = pointAngle(leftPoint);
    let end = pointAngle(rightPoint);

    while(end < start){
        end += 2*Math.PI;
    }

    if(end - start > Math.PI){
        end -= 2*Math.PI;
    }

    return generateArc(
        radius,
        start,
        end,
        steps
    );

}
function pointAngle(point){

    return Math.atan2(

        point.y,

        point.x

    );

}

function generateRootArc(startPoint,endPoint,radius,steps=30){

    let start = pointAngle(startPoint);
    let end = pointAngle(endPoint);

    while(end < start){

        end += 2*Math.PI;

    }

    return generateArc(

        radius,

        start,

        end,

        steps

    );

}



function buildGearOutline(dimensions){

    const tooth = buildTooth(dimensions);

    const pitchAngle =
        2 * Math.PI / dimensions.teeth;

    const outline = [];

    for(let i = 0; i < dimensions.teeth; i++){

        const angle = i * pitchAngle;

        const rotatedLeft =
            rotateCurve(
                tooth.leftSide,
                angle
            );

        const rotatedTip =
            rotateCurve(
                tooth.tipArc,
                angle
            );

        const rotatedRight =
            rotateCurve(
                tooth.rightSide,
                angle
            );

        const nextAngle =
            (i + 1) * pitchAngle;

        const nextLeft =
            rotateCurve(
                tooth.leftSide,
                nextAngle
            );


        const rootArc =
            generateRootArc(
                rotatedRight[rotatedRight.length - 1],
                nextLeft[0],
                dimensions.rootRadius,
                12
            );

        outline.push(
            ...rotatedLeft,
            ...rotatedTip,
            ...rotatedRight,
            ...rootArc
        );

    }

    console.log(outline.length);

    return outline;

}

function buildSVGPath(points) {

    if (points.length === 0) {

        return "";

    }

    let path = `M ${points[0].x} ${-points[0].y}`;

    for (let i = 1; i < points.length; i++) {

        path += ` L ${points[i].x} ${-points[i].y}`;

    }

    path += " Z";

    return path;

}



module.exports = {

    calculateDimensions,
    involutePoint,
    generateInvolute,
    rotatePoint,
    rotateCurve,
    buildTooth,
    buildGear,
    calculateAngles,
    positionInvolute,
    generateArc,
    generateTipArc,
    pointAngle,
    generateRootArc,
    buildGearOutline,
    buildSVGPath,
    buildOppositeInvolute

};


