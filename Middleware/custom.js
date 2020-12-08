const emailExistence = require('email-existence');

module.exports = {
  handleAuthError(err, req, res, next) {
    const output = {
      message: err.message,
    };
    const statusCode = err.statusCode || 401;
    res.status(statusCode).json({
      statusCode,
      ...output,
    });
  },

  checkHeader(req, res, next) {
    if (req.headers.authorization) return next();
    return res.status(401).json({
      statusCode: 401,
      message: 'Unauthorize missing header',
    });
  },

  validEmailcheck(req, res, next) {
    emailExistence.check(req.body.emailId, function (error, response) {
      if (response) return next();
      return res.status(401).json({
        statusCode: 401,
        message: `Couldn't find the account`,
      });
    });
  },
};
