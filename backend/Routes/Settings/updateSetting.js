const Setting = require("./setting.model");
const { getOrCreateSetting } = require("./settingStore");

// Only these top-level keys may be written through the admin settings endpoint.
// Spreading req.body straight into the update would let any caller inject
// arbitrary fields (roles, balances, _id, etc.) into the settings document, so
// the payload is filtered down to a known-safe set before being persisted.
const SAFE_FIELDS = [
    "name", "siteName", "siteLogo", "notice", "copyright",
    "ht_video", "acAmm",
];

const SAFE_BOOL_FIELDS = [
    "register", "withdraw",
];

const SAFE_NESTED = {
    accounts: ["phone", "whatsapp", "email", "bkash", "nagad", "rocket", "upay", "payeer"],
    links: ["whatsapp", "telegram", "facebook", "page", "video", "supportMessanger"],
    ref_comm: ["gen1", "gen2", "gen3", "gen4", "gen5", "gen6"],
};

const pickString = (v) => (typeof v === "string" ? v : undefined);

const sanitize = (input = {}) => {
    const clean = {};

    for (const key of SAFE_FIELDS) {
        if (input[key] !== undefined) {
            clean[key] = pickString(input[key]);
        }
    }

    for (const key of SAFE_BOOL_FIELDS) {
        if (input[key] !== undefined) {
            clean[key] = Boolean(input[key]);
        }
    }

    for (const parent of Object.keys(SAFE_NESTED)) {
        const src = input[parent];
        if (src && typeof src === "object") {
            const nested = {};
            let total = 0;
            for (const key of SAFE_NESTED[parent]) {
                if (src[key] !== undefined) {
                    if (parent === "ref_comm") {
                        const n = Number(src[key]);
                        if (!Number.isFinite(n)) {
                            nested[key] = undefined;
                            continue;
                        }
                        if (n < 0) {
                            throw new Error("Referral commission values cannot be negative");
                        }
                        total += n;
                        nested[key] = n;
                    } else {
                        nested[key] = pickString(src[key]);
                    }
                }
            }
            if (parent === "ref_comm" && total > 100) {
                throw new Error("Referral commission total cannot exceed 100%");
            }
            if (Object.keys(nested).length) {
                clean[parent] = nested;
            }
        }
    }

    // Bonus: mixed-type nested object (amount: Number, startDate/endDate: Date, active: Boolean)
    if (input.bonus && typeof input.bonus === "object") {
        const bonus = {};
        if (input.bonus.amount !== undefined) {
            const n = Number(input.bonus.amount);
            bonus.amount = Number.isFinite(n) ? n : 0;
        }
        const parseDate = (v) => {
            if (v === null || v === "" || v === undefined) return null;
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d;
        };
        if (input.bonus.startDate !== undefined) {
            bonus.startDate = parseDate(input.bonus.startDate);
        }
        if (input.bonus.endDate !== undefined) {
            bonus.endDate = parseDate(input.bonus.endDate);
        }
        if (input.bonus.active !== undefined) {
            bonus.active = Boolean(input.bonus.active);
        }
        if (bonus.startDate && bonus.endDate && bonus.endDate <= bonus.startDate) {
            throw new Error("Bonus startDate must be before endDate");
        }
        if (Object.keys(bonus).length) {
            clean.bonus = bonus;
        }
    }

    // Marketplace: its own explicit block, like `bonus` above. The generic
    // SAFE_NESTED loop coerces everything except ref_comm to String, which
    // would silently destroy these numbers. Note this is defense-in-depth —
    // the admin UI actually talks to the authenticated /tasks/admin/config
    // endpoint, not this one, but PUT /setting is admin-only too, so a
    // marketplace key sent here must not corrupt the document.
    if (input.marketplace && typeof input.marketplace === "object") {
        const m = input.marketplace;
        const marketplace = {};
        if (m.enabled !== undefined) {
            marketplace.enabled = Boolean(m.enabled);
        }
        if (m.commissionRate !== undefined) {
            const n = Number(m.commissionRate);
            if (!Number.isFinite(n) || n < 0 || n > 90) {
                throw new Error("Commission rate must be a number between 0 and 90");
            }
            marketplace.commissionRate = n;
        }
        if (m.autoApproveHours !== undefined) {
            const n = Number(m.autoApproveHours);
            if (!Number.isFinite(n) || n < 1) {
                throw new Error("Auto-approve hours must be a positive number");
            }
            marketplace.autoApproveHours = n;
        }
        if (m.reportWindowHours !== undefined) {
            const n = Number(m.reportWindowHours);
            if (!Number.isFinite(n) || n < 0) {
                throw new Error("Report window hours must be a non-negative number");
            }
            marketplace.reportWindowHours = n;
        }
        if (m.maxAttempts !== undefined) {
            const n = Number(m.maxAttempts);
            if (!Number.isFinite(n) || n < 1) {
                throw new Error("Max attempts must be a positive number");
            }
            marketplace.maxAttempts = n;
        }
        if (Object.keys(marketplace).length) {
            clean.marketplace = marketplace;
        }
    }

    return clean;
};

const updateSetting = async (data) => {
    try {
        // Merge sanitized fields over the current document so partial payloads
        // (e.g. a single tab) don't wipe the fields they don't mention.
        const current = await getOrCreateSetting();
        const clean = sanitize(data);

        const setting = await Setting.findByIdAndUpdate(
            current._id,
            { $set: clean },
            { new: true }
        );

        return {
            success: true,
            setting
        }
    } catch (error) {
        throw new Error(error);
    }
}
module.exports = updateSetting
