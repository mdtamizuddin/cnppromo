const { getOrCreateSetting } = require("./settingStore");

const getSetting = async () => {
    try {
        const setting = await getOrCreateSetting();
        // This endpoint is PUBLIC and unauthenticated, and its whole payload
        // is hydrated into Redux for every visitor. The marketplace
        // commission rate must never reach a worker's browser, so the whole
        // subtree is stripped here rather than relying on callers to be
        // careful. Admins read/write it through authenticated
        // GET/PUT /tasks/admin/config instead.
        const safe = setting.toObject();
        delete safe.marketplace;
        return {
            success: true,
            setting: safe
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}
module.exports = getSetting
