const jwt = require("jsonwebtoken");
const JWT_SECRET = require("./jwtSecret");

const tokenGenerator = (user) => {
    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, JWT_SECRET, // Use the proper secret here
        { expiresIn: "30d" });
    return token;
};

module.exports = tokenGenerator;
