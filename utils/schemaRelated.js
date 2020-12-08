const { hash } = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const sendMailToUser = require('./mailer');

module.exports = {
  // function for hashing the password
  async hashPassword(next) {
    const user = this;
    try {
      if (user.isModified('password')) {
        const hP = await hash(user.password, 10);
        user.password = hP;
        next();
      }
    } catch (error) {
      next(error);
    }
  },

  // function for token generation
  async generateToken(mode, role) {
    const user = this;
    const token = await sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: '12h',
      }
    );
    try {
      if (mode === 'confirm') {
        user.confirmToken = token;
        await sendMailToUser(mode, user.emailId, token, role);
      } else if (mode === 'reset') {
        user.resetToken = token;
        await sendMailToUser(mode, user.emailId, token);
      } else {
        user.accessToken = token;
      }
      await user.save();
      return token;
    } catch (error) {
      return error;
    }
  },
};
