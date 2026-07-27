exports.preview = (req, res) => {

    res.status(200).json({
        success: true,
        message: "Endpoint preview funcionando"
    });

};

const gearMath = require('../services/gearMath');
const fusionGenerator = require('../services/fusionGenerator');
const geometry3D = require('../services/geometry3D');

// POST /api/generate-script
exports.generateScript = (req, res) => {

    try {

        const dimensions =
            gearMath.calculateDimensions(

                Number(req.body.module),

                Number(req.body.teeth),

                Number(req.body.pressureAngle || 20)

            );

        const gearData =
            gearMath.buildGear(dimensions);

        gearData.dimensions.width =
            Number(req.body.width || 10);

        gearData.dimensions.bore =
            Number(req.body.bore || 5);

        const hubData =
            geometry3D.calculateHubAndKeyway(
                gearData.dimensions.bore
            );

        gearData.dimensions = {

            ...gearData.dimensions,

            ...hubData

        };

        const pythonScript =
            fusionGenerator.generatePythonScript(
                gearData
            );

        res.setHeader(
            'Content-Type',
            'text/x-python'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename="gear_generator.py"'
        );

        res.send(pythonScript);

    } catch(error){

        res.status(500).json({

            success:false,

            message:'Error generando el script',

            error:error.message

        });

    }

};