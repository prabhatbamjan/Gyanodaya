const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'boylama846@gmail.com',
          pass: 'tbgl qhuo ugxr dixj'
        }
      })

    // Define the email options
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // Send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail; 