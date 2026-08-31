const { getOrCreateSetting } = require("./settingStore");

const getSetting = async () => {
    try {
        const setting = await getOrCreateSetting();
        return {
            success: true,
            setting
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}
module.exports = getSetting
