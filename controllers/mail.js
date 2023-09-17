const nodemailer = require('nodemailer');
const User = require('../models/user');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

const sendVerificationEmail = (userEmail, verificationToken) => {
const verificationLink = `http://localhost:8080/users/verify/${verificationToken}`;
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL,
    to: userEmail,
    subject: 'Верифікація email',
    text: 'Клікніть на посилання нижче, щоб підтвердити свій email:',
    html: `<a href="${verificationLink}">Посилання для верифікації</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Помилка при надсиланні листа: ' + error);
      } else {
        console.log('Лист надіслано: ' + info.response);
      }
  });
};

module.exports = { sendVerificationEmail };
