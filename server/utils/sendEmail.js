const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Google App Password
      },
      tls: {
        rejectUnauthorized: false
      },
      family: 4 // Forces IPv4 to completely avoid Render network timeout / ENETUNREACH issues
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to}`);
  } catch (error) {
    console.error('Email send failed:', error.message);
  }
};

module.exports = sendEmail;