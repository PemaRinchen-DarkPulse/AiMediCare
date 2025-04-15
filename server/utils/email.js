const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

// Set SendGrid API key if available
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send email using available methods
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text version of email
 * @param {String} options.html - HTML version of email
 */
const sendEmail = async (options) => {
  // Log important info for debugging
  console.log('Attempting to send email');
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  
  // Use Ethereal for development/testing if no other services are configured
  if (!process.env.SENDGRID_API_KEY && !process.env.EMAIL_PASSWORD) {
    console.log('Using Ethereal Email for testing (emails will not be delivered to real inboxes)');
    try {
      // Create test account on Ethereal
      const testAccount = await nodemailer.createTestAccount();
      console.log('Created Ethereal test account');

      // Create reusable transporter using the Ethereal test account
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      // Send mail with the test account
      const info = await transporter.sendMail({
        from: '"AiMediCare" <no-reply@aimedicare.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });

      console.log('Email sent to Ethereal! Preview URL: %s', nodemailer.getTestMessageUrl(info));
      console.log('To view test emails, check the preview URL above ☝️');
      return;
    } catch (etherealError) {
      console.error('Ethereal test email setup failed:', etherealError.toString());
      // Continue to try other methods
    }
  }

  // Try SendGrid if API key is available
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('Attempting to send email with SendGrid');
      
      const msg = {
        to: options.to,
        from: process.env.EMAIL_FROM || 'no-reply@aimedicare.com',
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      // Send email using SendGrid
      await sgMail.send(msg);
      console.log('Email sent successfully via SendGrid!');
      return;
    } catch (error) {
      console.error('SendGrid email sending failed:', error.toString());
      // Fall through to next method
    }
  }
  
  // Try Gmail SMTP if credentials are available
  if (process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD) {
    try {
      console.log('Using Gmail SMTP via Nodemailer...');
      
      // Create Gmail SMTP transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASSWORD // Should be an app password for Gmail
        }
      });
      
      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      
      console.log('Email sent via Gmail!', info.messageId);
      return;
    } catch (fallbackError) {
      console.error('Gmail SMTP failed:', fallbackError.toString());
      // Continue to error handling
    }
  }
  
  // If we get here, all email methods failed
  console.error('⚠️ WARNING: Email sending failed. Please check your email configuration.');
  console.log('Email was supposed to be sent to:', options.to);
  console.log('With subject:', options.subject);
  console.log('Email content was not delivered to the recipient.');
};

module.exports = sendEmail;