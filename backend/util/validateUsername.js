/**
 * Validates a username against standard naming conventions:
 * 1. 4-20 characters in length.
 * 2. Only lowercase alphanumeric characters, underscores (_), and hyphens (-).
 * 3. Cannot be an email or contain @.
 * 4. Must start and end with a letter or number.
 * 5. Cannot contain spaces or consecutive special characters.
 */
const validateUsername = (raw) => {
    if (!raw || typeof raw !== "string") {
        return { valid: false, message: "Username is required." };
    }
    const username = raw.trim().toLowerCase();

    if (username.length < 4 || username.length > 20) {
        return { valid: false, message: "Username must be between 4 and 20 characters long." };
    }

    if (username.includes(" ")) {
        return { valid: false, message: "Username cannot contain spaces." };
    }

    if (username.includes("@") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
        return { valid: false, message: "Username cannot be an email address." };
    }

    if (!/^[a-z0-9]/.test(username)) {
        return { valid: false, message: "Username must start with a letter or number." };
    }

    if (!/[a-z0-9]$/.test(username)) {
        return { valid: false, message: "Username must end with a letter or number." };
    }

    if (username.includes("__") || username.includes("--") || username.includes("-_") || username.includes("_-")) {
        return { valid: false, message: "Username cannot contain consecutive special characters." };
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
        return { valid: false, message: "Username can only contain letters, numbers, underscores, and hyphens." };
    }

    return { valid: true, username };
};

module.exports = validateUsername;
