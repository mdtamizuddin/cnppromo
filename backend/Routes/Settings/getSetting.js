const Setting = require("./setting.model");

const getSetting = async () => {
    try {
        const setting = await Setting.findById('66a4a094c8d1fd11daac6c28');
        if (!setting) {
            return {
                success: false,
                message: "Setting not found"
            }
        }
        return {
            success: true,
            setting
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}
module.exports = getSetting