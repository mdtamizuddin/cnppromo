const nodemailer = require('nodemailer');

const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp-relay.brevo.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT, 10) || 587;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS || '';
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // use TLS
    auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_PASSWORD,
    },
});

module.exports = transporter;