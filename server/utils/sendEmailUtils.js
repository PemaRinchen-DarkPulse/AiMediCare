const transporter = require('../services/emailServices.js'); // Import the transporter service

// Send email function
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: "blazepknight@gmail.com", // Sender's email
    to,
    subject,
    text
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error.message, details: error.response || error.stack };
  }
};

module.exports = sendEmail;
