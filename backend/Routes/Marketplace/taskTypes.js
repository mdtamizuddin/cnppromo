// Declarative registry of task types. One definition drives the provider's
// create form, the worker's proof form, and server-side validation, so the
// three can never drift apart — see PROJECT_GUIDE / plan §1b.
//
// gate:
//   WATCH_SESSION — embedded player, server credits time only while playing
//   DWELL         — external link, server credits time only while our tab is hidden
//   NONE          — no timer, proof alone
//
// config: fields the PROVIDER sets at task-creation time, rendered into the
//         create form automatically. Currently only `minDurationSeconds`.
// proof:  per-field requirement for what the WORKER submits — "required",
//         "optional", or "none". A provider may raise "optional" to
//         "required" via requiresScreenshot/requiresProofUrl on the task,
//         but may never relax a "required" entry.
const TASK_TYPES = {
    WATCH: {
        label: "Watch a video",
        platforms: ["youtube", "facebook", "tiktok", "instagram", "website", "other"],
        gate: "WATCH_SESSION",
        config: {
            minDurationSeconds: { type: "number", required: true, default: 60, min: 5 },
        },
        proof: { account: "optional", url: "none", screenshot: "optional" },
    },
    VISIT: {
        label: "Visit a website",
        platforms: ["website", "app", "other"],
        gate: "DWELL",
        config: {
            minDurationSeconds: { type: "number", required: true, default: 30, min: 5 },
        },
        proof: { account: "none", url: "none", screenshot: "optional" },
    },
    LIKE: {
        label: "Like a post",
        platforms: ["facebook", "instagram", "tiktok", "twitter", "youtube", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 10 } },
        proof: { account: "required", url: "none", screenshot: "required" },
    },
    FOLLOW: {
        label: "Follow an account",
        platforms: ["facebook", "instagram", "tiktok", "twitter", "telegram", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 15 } },
        proof: { account: "required", url: "none", screenshot: "required" },
    },
    SUBSCRIBE: {
        label: "Subscribe to a channel",
        platforms: ["youtube", "tiktok", "facebook", "instagram", "telegram", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 15 } },
        proof: { account: "required", url: "none", screenshot: "required" },
    },
    SHARE: {
        label: "Share a post",
        platforms: ["facebook", "instagram", "twitter", "whatsapp", "telegram", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 10 } },
        proof: { account: "required", url: "optional", screenshot: "required" },
    },
    COMMENT: {
        label: "Leave a comment",
        platforms: ["facebook", "instagram", "youtube", "tiktok", "twitter", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 20 } },
        proof: { account: "required", url: "required", screenshot: "required" },
    },
    POST: {
        label: "Create a post",
        platforms: ["facebook", "instagram", "twitter", "linkedin", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 20 } },
        proof: { account: "required", url: "required", screenshot: "required" },
    },
    REVIEW: {
        label: "Write a review",
        platforms: ["website", "app", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 30 } },
        proof: { account: "required", url: "optional", screenshot: "required" },
    },
    SIGNUP: {
        label: "Sign up / register",
        platforms: ["website", "app", "other"],
        gate: "DWELL",
        config: { minDurationSeconds: { type: "number", required: false, default: 30 } },
        proof: { account: "required", url: "none", screenshot: "required" },
    },
    INSTALL: {
        label: "Install an app",
        platforms: ["app", "other"],
        gate: "NONE",
        config: {},
        proof: { account: "optional", url: "none", screenshot: "required" },
    },
    SURVEY: {
        label: "Complete a survey",
        platforms: ["website", "other"],
        gate: "NONE",
        config: {},
        proof: { account: "none", url: "none", screenshot: "optional" },
    },
    CUSTOM: {
        label: "Custom task",
        platforms: ["website", "app", "facebook", "instagram", "tiktok", "youtube", "twitter", "telegram", "whatsapp", "linkedin", "other"],
        gate: "NONE",
        config: {},
        proof: { account: "optional", url: "optional", screenshot: "optional" },
    },
};

const TASK_TYPE_KEYS = Object.keys(TASK_TYPES);
const PLATFORMS = ["youtube", "tiktok", "facebook", "instagram", "twitter", "telegram", "whatsapp", "linkedin", "website", "app", "other"];

const getTaskType = (key) => TASK_TYPES[key];

// Validates and normalises a provider-supplied typeConfig against the
// registry entry for taskType. Throws on anything that would leave the
// config inconsistent with what the gate needs to enforce.
const normalizeTypeConfig = (taskType, rawConfig = {}) => {
    const def = getTaskType(taskType);
    if (!def) throw new Error("Unknown task type");
    if (!def.platforms) throw new Error("Task type is misconfigured");

    const config = {};
    for (const [key, spec] of Object.entries(def.config || {})) {
        const raw = rawConfig[key];
        if (spec.type === "number") {
            const n = raw === undefined || raw === null || raw === "" ? spec.default : Number(raw);
            if (spec.required && !Number.isFinite(n)) {
                throw new Error(`"${key}" is required for this task type`);
            }
            const value = Number.isFinite(n) ? n : spec.default;
            if (spec.min !== undefined && value < spec.min) {
                throw new Error(`"${key}" must be at least ${spec.min}`);
            }
            config[key] = value;
        }
    }
    return config;
};

module.exports = { TASK_TYPES, TASK_TYPE_KEYS, PLATFORMS, getTaskType, normalizeTypeConfig };
