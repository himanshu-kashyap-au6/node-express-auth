const passport = require('passport');
const { Strategy: localStrategy } = require('passport-local');
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');
const { checkRole } = require('../controller/commonController');
const User = require('../model/Users');
const Employee = require('../model/Employee');
const mongoose = require('mongoose');
// passport-local Strategy for user-login
passport.use(
  new localStrategy(
    {
      usernameField: 'emailId',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const mType = await checkRole(req.query);
        let data = null;
        // finding the user by static method
        const user = await mongoose
          .model(mType)
          .findByEmailAndPassword(email, password);

        // condition to check whether user has confirmed his email or not
        if (!user.isConfirm) {
          throw new Error('Please confirm your email first');
        }
        data = user;
        return done(null, data);
      } catch (err) {
        if (err.name === 'authError')
          done(null, false, {
            message: err.message,
          });
        done(err);
      }
    }
  )
);

// passport-jwt Strategy for protective routes
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  ]),
  secretOrKey: process.env.JWT_SECRET_KEY,
  passReqToCallback: true,
};

passport.use(
  new JWTStrategy(jwtOptions, async (req, { id }, done) => {
    try {
      let data = null;
      const mType = await checkRole(req.query);
      const user = await mongoose.model(mType).findById(id);
      if (user) data = user;
      done(null, data);
    } catch (err) {
      if (err.name === 'Error') done(err);
    }
  })
);
