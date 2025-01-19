const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 465,
  secure: true,
  auth: {
    user: "8324a9001@smtp-brevo.com", // SMTP login email
    pass: "WPTgwjt7cHv35bzp"  // SMTP password
  },
  tls: {
    rejectUnauthorized: false // Ignore self-signed certificates
  },
  debug: true,
  logger: true
});

// Export the transporter so it can be used elsewhere
module.exports = transporter;
