const User = require('../model/Users');
const Employee = require('../model/Employee');
const { validationResult } = require('express-validator');
const { modelTypes } = require('../Config/global');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { hash } = require('bcryptjs');
const { fieldArray, sortFieldArray, fieldObject } = require('../Config/global');
const { generateToken } = require('../utils/schemaRelated');

// function to get the object for field-parameters
const fieldParameters = (query) => {
  return new Promise((resolve, reject) => {
    try {
      const serachFields = [];
      if (query.hasOwnProperty('_id'))
        query._id = mongoose.Types.ObjectId(query._id);

      fieldArray.map((field) => {
        if (query.hasOwnProperty(field)) {
          serachFields.push({ [field]: query[field] });
        }
      });
      resolve(serachFields);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

// function to get the object for sort-parameters
const sortParameters = (query) => {
  return new Promise((resolve, reject) => {
    const sortFields = {};
    sortFieldArray.map((field) => {
      if (query.hasOwnProperty(field)) {
        let orgField = fieldObject[field];
        sortFields[orgField] = isNaN(Number(query[field]))
          ? 0
          : Number(query[field]);
      }
    });
    resolve(sortFields);
  });
};

// function to check valid role and get respective model name
const checkRole = (query) => {
  return new Promise((resolve, reject) => {
    try {
      const role = query.role;
      // to check whether query is present or not
      if (!role)
        return reject({
          name: 'Error',
          statusCode: 400,
          message: 'A valid role is required',
        });
      const check = modelTypes[role];
      // check for a valid model
      if (!check)
        return reject({
          name: 'Error',
          statusCode: 400,
          message: 'Invalid role',
        });
      resolve(check);
    } catch (error) {
      reject({ error });
    }
  });
};

// function to check if any error present or not
const checkError = (req) => {
  return new Promise((resolve, reject) => {
    const error = validationResult(req);
    try {
      if (!error.isEmpty())
        return reject({
          statusCode: 400,
          message: error.array(),
        });
      resolve('No error');
    } catch (error) {
      reject(error);
    }
  });
};

// function for psgination
const pagination = (query) => {
  return new Promise((resolve, reject) => {
    try {
      const limit = isNaN(query.limit) ? 0 : parseInt(query.limit) || 0;
      const skip = isNaN(query.skip) ? 1 : query.skip || 1;
      const calcSkip =
        parseInt(limit) * (parseInt(skip) - 1) > 0
          ? parseInt(limit) * (parseInt(skip) - 1)
          : 0;
      resolve({ limit, calcSkip });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  fieldParameters,
  sortParameters,
  checkRole,
  checkError,
  pagination,

  // functiom to get all the token for testing purpose
  async getToken(req, res) {
    try {
      const mType = await checkRole(req.query);
      const user = await mongoose.model(mType).findById(req.user._id);
      return res.status(200).json({ user: user._doc });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message,
      });
    }
  },

  // function for registeration
  async registerUser(req, res) {
    try {
      const mType = await checkRole(req.query);
      // condition to check all required parameters present or not
      await checkError(req);
      const {
        firstName,
        lastName,
        emailId,
        password,
        organizationName,
      } = req.body;

      // for creating a unique publicId
      const publicId = crypto.randomBytes(4).toString('hex');
      // condition to check if user already exists or not
      const checkInDb = await mongoose.model(mType).findOne({
        emailId,
      });
      if (checkInDb)
        return res.status(400).json({
          statusCode: 400,
          msg: 'Bad request Email Already exist',
        });

      // create user/employee
      const user = await mongoose.model(mType).create({
        firstName,
        lastName,
        emailId,
        password,
        organizationName,
        publicId,
      });
      await user.generateToken('confirm', req.query.role);
      return res.status(201).json({
        statusCode: 201,
        confirmation:
          'User registered successfully please check your indox to confirm the email',
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: err.message,
      });
    }
  },

  // login function
  async login(req, res) {
    try {
      // condition to check all required parameters present or not
      await checkError(req);
      const user = req.user;
      // access token creation to check whether user is logedin or not
      const accessToken = await user.generateToken('login');
      return res.status(200).json({
        statusCode: 200,
        data: user,
        accessToken: `JWT ${accessToken}`,
        expiresIn: '12h',
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        statusCode: err.statusCode || 500,
        message: 'Server Error',
      });
    }
  },

  // get profile authenticated route
  async getProfile(req, res) {
    try {
      return res.status(200).json(req.user);
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Server Error',
      });
    }
  },

  // logout function
  async logOut(req, res) {
    try {
      const user = req.user;
      // deleting accessToken
      await user.updateOne({
        accessToken: '',
      });
      user.save();
      return res.status(200).json({
        statusCode: 200,
        message: 'LogOut Successfully',
      });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Server Error',
      });
    }
  },

  // chnage-password function
  async changePassword(req, res) {
    try {
      const mType = await checkRole(req.query);
      // // condition to check all required parameters present or not
      await checkError(req);
      const { emailId, oldPassword, newPassword } = {
        ...req.body,
      };
      // hashing the password before saving it
      const hp = await hash(newPassword, 10);
      const user = await mongoose
        .model(mType)
        .findByEmailAndPassword(emailId, oldPassword);
      await user.updateOne({
        password: hp,
      });
      return res.status(200).json({
        statusCode: 200,
        message: 'Password Changed successfully',
      });
    } catch (err) {
      if (err.name === 'Auth Error')
        return res.status(401).json({
          statusCode: 401,
          message: 'Invalid credentials',
        });
      return res.status(500).json({
        statusCode: 500,
        message: 'Server Error',
      });
    }
  },

  // forgot-password function
  async forgotPasswordEmail(req, res) {
    try {
      const { emailId } = req.body;
      const mType = await checkRole(req.query);
      // condition to check all required parameters present or not
      await checkError(req);
      // Ask for user details!
      // No user. There is no user present in our database .. Kindly register first
      // 1. generateToken()
      // 2. Email sent successfully
      const user = await mongoose.model(mType).findOne({
        emailId,
      });
      if (user) {
        await user.generateToken('reset');
        return res.json({
          statusCode: 200,
          message: 'Email sent for reset password. Please Check your inbox!',
        });
      } else {
        return res.json({
          statusCode: 401,
          message: 'Unauthorize',
        });
      }
    } catch (err) {
      return res.json({
        statusCode: err.statusCode || 500,
        message: err.message || 'Server Error',
      });
    }
  },

  // reset-password function
  async resetPassword(req, res) {
    try {
      // // condition to check all required parameters present or not
      await checkError(req);
      const mType = await checkRole(req.query);
      // Finding the user with the help of jwt-stretegy
      const resetToken = req.user.resetToken;
      if (!resetToken) {
        return res.json({
          statusCode: 401,
          message: 'Token already used',
        });
      }
      const user = await mongoose.model(mType).findOne({
        resetToken,
      });
      const { newPassword, confirmPassword } = {
        ...req.body,
      };
      if (newPassword !== confirmPassword)
        return res.json({
          statusCode: 400,
          message: 'Password Do not match',
        });
      const hp = await hash(newPassword, 10);
      if (user) {
        // reset resetToken and update password
        await user.updateOne({
          password: hp,
          resetToken: '',
        });
        return res.status(200).json({
          statusCode: 200,
          message: 'newPassword set successfully',
        });
      } else {
        return res.json({
          statusCode: 401,
          message: 'Unauthorize',
        });
      }
    } catch (err) {
      return res.json({
        statusCode: 500,
        message: 'Server Error',
      });
    }
  },

  // confrim email function
  async confirmEmail(req, res) {
    try {
      const mType = await checkRole(req.query);
      // Finding the user with the help of token
      const confirmToken = req.params.id;
      const user = await mongoose.model(mType).findOne({
        confirmToken,
      });
      if (user && user.confirmToken !== '') {
        // reset the confirmation token
        await user.updateOne({
          isConfirm: true,
          confirmToken: '',
        });
        return res.status(200).json({
          statusCode: 200,
          message: 'Email Confirmed successfully. \n You can log in now',
        });
      } else {
        return res.json({
          statusCode: 401,
          message: 'Unauthorize',
        });
      }
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Server Error',
      });
    }
  },

  // get search data by end-user
  async getData(req, res) {
    try {
      const mType = await checkRole(req.query);
      const serachFields = await fieldParameters(req.query);
      const sortFields = await sortParameters(req.query);
      let { limit, calcSkip } = await pagination(req.query);
      const searchObject =
        serachFields.length === 0 ? {} : { $and: [...serachFields] };
      const sortObject =
        Object.keys(sortFields).length === 0 ? {} : { ...sortFields };
      const totalObject = await mongoose
        .model(mType)
        .find(searchObject)
        .sort(sortObject);
      const maxLimit = totalObject.length;
      // condition to check user should not exceed max limit
      limit > maxLimit
        ? ((limit = maxLimit), (calcSkip = 0))
        : calcSkip >= maxLimit - limit
        ? maxLimit - limit >= 0
          ? (calcSkip = maxLimit - limit)
          : 0
        : calcSkip;
      const data = await mongoose
        .model(mType)
        .find(searchObject)
        .sort(sortObject)
        .limit(limit)
        .skip(calcSkip);
      // condition to check whether data exists or not with and without search query.
      if (data.length === 0)
        return res
          .status(200)
          .json({ statusCode: 200, message: 'No data found!' });
      return res.status(200).json({ statusCode: 200, data, maxLimit });
    } catch (err) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Server Error',
      });
    }
  },
};
