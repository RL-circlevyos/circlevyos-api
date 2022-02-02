const nodemailer = require("nodemailer");
require("dotenv").config();

const mailHelper = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    // from: "sayanm816@gmail.com", // sender address
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };
  // send mail with defined transport object
  await transporter.sendMail(message);
};

module.exports = mailHelper;
