const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

module.exports.sendMail = async (options) => {

  const message = {
    from: '"Allen K Abraham" <allenabraham777@gmail.com>',
    to: options.email,
    subject: options.subject || '',
    text: options.message || '',
    html: options.html || '<span></span>'
  }

  // send mail with defined transport object
  return await transporter.sendMail(message);
}
