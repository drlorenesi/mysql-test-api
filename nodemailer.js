require('dotenv').config();
const nodemailer = require('nodemailer');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let email = 'drlorenesi@gmail.com';
const confirmation = uuidv4();
let activate = `http://localhost:3000/api/activate/?x=' . urlencode($e) . '&y=' . $a`;

let activate = `<a href="' . $activate . '"class="alert-link">' . $activate . ' </a>`;

let message = `<h3>Hello!</h3>
  <p>Thank you for registering! Please click on the confirmation code below to activate your account:</p>
  <p><a href="http://localhost:3000/api/activate/${confirmation}"></a></p>`;

async function main() {
  try {
    let info = await transporter.sendMail({
      from: `"Chocolates 🍫" <${process.env.EMAIL_USER}>`,
      to: 'drlorenesi@gmail.com',
      subject: 'Activate Account',
      html: message,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (ex) {
    console.log(chalk.red(`Error: ${ex.response}`));
  }
}

main();
