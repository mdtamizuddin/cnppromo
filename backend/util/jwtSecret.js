/**
 * Single source of truth for the JWT signing secret.
 *
 * There is deliberately no fallback value: a hardcoded default that ships in
 * the repository is a publicly known secret, and anyone holding it can forge
 * an admin token. If JWT_SECRET is missing we fail at boot instead.
 */
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 16) {
    throw new Error(
        "JWT_SECRET is missing or too short. Set a random secret of at least 16 characters in backend/.env before starting the server."
    );
}

module.exports = JWT_SECRET;
