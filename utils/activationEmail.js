const nodemailer = require('nodemailer');
const chalk = require('chalk');

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async (name, email, activate) => {
  let link = `${process.env.BASE_URL}?x=${encodeURIComponent(
    email
  )}&y=${activate}`;
  try {
    let info = await transporter.sendMail({
      from: `"Users API 👋" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Please Activate your Account',
      html: `<h3>Hi ${name}!</h3>
      <p>Thanks for registering! Please click on the confirmation code below to activate your account:</p>
      <p><a href="${link}">${link}</a></p>`,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (ex) {
    console.log(chalk.red(`Error: ${ex.response}`));
  }
};
