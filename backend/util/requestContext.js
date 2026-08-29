const { UAParser } = require("ua-parser-js");

// Raw user-agent strings are attacker-controlled and unbounded; store a sane slice.
const MAX_UA_LENGTH = 512;

/**
 * The client's address.
 *
 * Relies on `app.set("trust proxy", ...)` being configured — without it Express
 * reports the reverse proxy's address and every session looks identical.
 */
const clientIp = (req) => {
    const ip = req.ip || req.socket?.remoteAddress || "";
    // Node reports IPv4 over a dual-stack socket as "::ffff:203.0.113.4".
    return ip.replace(/^::ffff:/, "") || "unknown";
};

// Windows only reports "Windows NT 10.0" for both 10 and 11 — telling them apart
// needs client hints the browser sends separately, so 11 shows as 10 here.
const prettyOs = (os) => {
    if (!os?.name) return "Unknown OS";
    return os.version ? `${os.name} ${os.version}` : os.name;
};

const prettyBrowser = (browser) => {
    if (!browser?.name) return "Unknown browser";
    const major = String(browser.version || "").split(".")[0];
    return major ? `${browser.name} ${major}` : browser.name;
};

/**
 * A human label for the device.
 *
 * Precision here is capped by what the user-agent actually carries: iOS reports
 * a bare "iPhone" with no model, while Android usually carries a model code
 * ("SM-S911B") rather than its marketing name.
 */
const deviceName = (device, os) => {
    if (device?.model) {
        const model = device.model;
        // "Macintosh" as a model is less useful than the OS name.
        if (model === "Macintosh") return "Mac";
        // Android reports a bare part number ("SM-S911B") that means nothing on
        // its own, so it gets the vendor in front. Names that already read as a
        // product ("iPhone", "Pixel 8") do not — "Apple iPhone" is just noise.
        const isPartNumber = /^[A-Z0-9][A-Z0-9\s-]*$/.test(model);
        return isPartNumber && device.vendor && !model.startsWith(device.vendor)
            ? `${device.vendor} ${model}`
            : model;
    }
    const osName = os?.name || "";
    if (osName.startsWith("Windows")) return "Windows PC";
    if (osName === "macOS" || osName === "Mac OS") return "Mac";
    if (osName === "Linux" || osName === "Ubuntu") return "Linux PC";
    if (osName) return `${osName} device`;
    return "Unknown device";
};

/**
 * Everything we record about where a login came from.
 *
 * Location is deliberately not resolved: it would mean either a 150MB offline
 * GeoIP database or sending user IPs to a third party, and the IP alone is
 * enough to recognise an unfamiliar device.
 */
const describeRequest = (req) => {
    const userAgent = String(req.headers["user-agent"] || "").slice(0, MAX_UA_LENGTH);
    const parsed = new UAParser(userAgent).getResult();

    return {
        ip: clientIp(req),
        userAgent,
        device: {
            kind: parsed.device?.type || "desktop", // ua-parser omits type for desktops
            name: deviceName(parsed.device, parsed.os),
            os: prettyOs(parsed.os),
            browser: prettyBrowser(parsed.browser),
        },
    };
};

module.exports = { describeRequest, clientIp };
