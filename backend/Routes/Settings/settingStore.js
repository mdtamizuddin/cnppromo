const Setting = require("./setting.model");

const MAIN_SETTING_ID = "66a4a094c8d1fd11daac6c28";

/**
 * Fetch the single site settings document. If none exists yet (fresh install),
 * create one with the schema defaults so GET /setting never 500s on first boot.
 */
const getOrCreateSetting = async () => {
    let setting = await Setting.findById(MAIN_SETTING_ID);
    if (!setting) {
        // Fall back to any existing doc, then seed defaults as a last resort.
        setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create({
                _id: MAIN_SETTING_ID,
                name: "main",
                siteName: "CNP-PROMO",
            });
        }
    }
    return setting;
};

module.exports = { getOrCreateSetting, MAIN_SETTING_ID };
