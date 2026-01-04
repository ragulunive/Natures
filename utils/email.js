const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ragul <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        // service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME, //  'ragul.n.1995@gmail.com',
          pass: process.env.EMAIL_PASSWORD, // 'vegh pwlj kkxc zhjh', //
        },
      });
    }
  }
  async send(template, subject) {
    // 1) Render HTMl
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2) define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    //create tranport

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token valid for only 10 minutes'
    );
  }
};

// const sendEmail = async (options) => {
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EMAIL_PORT,
//   //   secure: false,
//   //   // service: 'gmail',
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME, //  'ragul.n.1995@gmail.com',
//   //     pass: process.env.EMAIL_PASSWORD, // 'vegh pwlj kkxc zhjh', //
//   //   },
//   // });

//   // const mailOptions = {
//   //   from: 'ragul.n.1995@gmail.com',
//   //   to: options.email,
//   //   subject: options.subject,
//   //   text: options.message,
//   // };

// };

// // module.exports = sendEmail;
