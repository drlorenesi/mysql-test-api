require('dotenv').config();
const nodemailer = require('nodemailer');
const chalk = require('chalk');
const { v4: uuidv4 } = require('uuid');
const confirmation = uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'

let transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let message = `<h3>Hello!</h3>
  <p>Thank you for filling out our form! Please click on the confirmation code below:</p>
  <p><a href="http://localhost:3000/api/activate/${confirmation}"></a></p>`;

async function main() {
  try {
    let info = await transporter.sendMail({
      from: `"Chocolates 🍫" <${process.env.EMAIL_USER}>`,
      to: 'drlorenesi@gmail.com',
      subject: 'Hello ✔',
      html: message,
    });
    console.log('Message sent: %s', info.messageId);
  } catch (ex) {
    console.log(chalk.red(`Error: ${ex.response}`));
  }
}

main();
