const nodemailer = require('nodemailer');
const { USER_EMAIL, USER_PASSWORD } = process.env;

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: USER_EMAIL,
    pass: USER_PASSWORD,
  },
  debug: true,
  tls: {
    rejectUnauthorized: false,
  },
});

// custom function to send email as per given given parameters
const sendMailToUser = async (mode, email, token, role) => {
  const domainName = process.env.DOMAIN_NAME || `http://localhost:3000`;
  let html = null;

  mode === 'confirm'
    ? (html = `<h1>Welcome to Antarctica global</h1>
      <p>Thanks for creating an account. Please Click 
      <a href=${domainName}/api/confirm-email/${token}?role=${role}>here</a> to confirm your account. Thankyou</p>`)
    : mode === 'reset'
    ? (html = `<h1>Hi there.</h1>
      <p>You have recently requested for a change in password please use the <strong>token: JWT ${token}</strong> and fill the required fields to reset your password.
      If you didn't initiate the request. Kindly ignore. Thanksyou</p>`)
    : null;

  const message = (mode) => {
    let msg = null;
    mode === 'confirm'
      ? (msg = 'Confirm your email')
      : mode === 'reset'
      ? (msg = 'Reset your password')
      : null;
    return msg;
  };
  try{
    await transporter.sendMail({
      from: USER_EMAIL, // sender address
      to: email, // list of receivers
      subject: message(mode), // Subject line
      html, // html body
    });
  }catch(err){
    throw err
  }
};

module.exports = sendMailToUser;
