const Router = require('express').Router();
const passport = require('passport');
const { check } = require('express-validator');
const {
  registerUser,
  login,
  getProfile,
  changePassword,
  logOut,
  forgotPasswordEmail,
  resetPassword,
  confirmEmail,
  getData,
  getToken,
} = require('../../controller/commonController');
const { checkHeader, validEmailcheck } = require('../../Middleware/custom');

Router.post(
  '/register',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check(
      'firstName',
      'First name should contain atleast Two characters'
    ).isLength({
      min: 2,
    }),
    check('lastName', 'Last name is required').not().isEmpty(),
    check(
      'lastName',
      'Last name should contain atleast Two characters'
    ).isLength({
      min: 2,
    }),
    check('emailId', 'Email is required').not().isEmpty(),
    check('emailId', 'Invalid Email').isEmail(),
    check('password', 'password is required').not().isEmpty(),
    check('password', 'Password should be of atleast 4 charaters').isLength({
      min: 4,
    }),
    check('organizationName', 'Organization name is required').not().isEmpty(),
  ],
  validEmailcheck,
  registerUser
);

Router.get('/confirm-email/:id', confirmEmail);

Router.post(
  '/login',
  [
    check('emailId', 'Email is required').not().isEmpty(),
    check('emailId', 'Please enter a valid email').isEmail(),
    check('password', 'password is required').not().isEmpty(),
  ],
  passport.authenticate('local', {
    session: false,
  }),
  login
);

Router.get(
  '/profile',
  checkHeader,
  passport.authenticate('jwt', {
    session: false,
  }),
  getProfile
);

Router.patch(
  '/change-password',
  [
    check('emailId', 'Email is required').not().isEmpty(),
    check('emailId', 'Please enter a valid email').isEmail(),
    check('oldPassword', 'old password is required').not().isEmpty(),
    check('newPassword', 'new password is required').not().isEmpty(),
    check('newPassword', 'Password should be of atleast 4 charaters').isLength({
      min: 4,
    }),
  ],
  checkHeader,
  passport.authenticate('jwt', {
    session: false,
  }),
  changePassword
);

Router.delete(
  '/logout',
  checkHeader,
  passport.authenticate('jwt', {
    session: false,
  }),
  logOut
);

Router.post(
  '/forgot-password',
  [
    check('emailId', 'Email is required').not().isEmpty(),
    check('emailId', 'Invalid Email').isEmail(),
  ],
  validEmailcheck,
  forgotPasswordEmail
);

Router.post(
  '/reset-password',
  [
    check('newPassword', 'new password is required').not().isEmpty(),
    check('newPassword', 'Password should be of atleast 4 charaters').isLength({
      min: 4,
    }),
    check('confirmPassword', 'new password is required').not().isEmpty(),
    check(
      'confirmPassword',
      'Password should be of atleast 4 charaters'
    ).isLength({
      min: 4,
    }),
  ],
  checkHeader,
  passport.authenticate('jwt', {
    session: false,
  }),
  resetPassword
);

Router.get('/get-data', getData);

Router.get(
  '/get-token',
  checkHeader,
  passport.authenticate('jwt', {
    session: false,
  }),
  getToken
);

module.exports = Router;
