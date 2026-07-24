exports.preview = (req, res) => {

    res.status(200).json({
        success: true,
        message: "Endpoint preview funcionando"
    });

};

exports.generateScript = (req, res) => {

    res.status(200).json({
        success: true,
        message: "Endpoint generate-script funcionando"
    });

};