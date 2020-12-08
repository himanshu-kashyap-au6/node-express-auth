const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { hashPassword, generateToken } = require('../utils/schemaRelated');
const { compare } = require('bcryptjs');

const UserSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    emailId: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'User already registered'],
      trim: true,
      validate: {
        validator: (v) =>
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v),
        message: 'Please enter a valid email',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Too short password'],
      trim: true,
    },
    organizationName: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isConfirm: {
      type: Boolean,
      default: process.env.NODE_ENV === 'DEV' ? false : true,
    },
    accessToken: {
      type: String,
      trim: true,
    },
    confirmToken: {
      type: String,
      trim: true,
    },
    resetToken: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', hashPassword);

UserSchema.methods.generateToken = generateToken;

UserSchema.statics.findByEmailAndPassword = async (emailId, password) => {
  try {
    const user = await User.findOne({
      emailId,
    });
    if (!user) throw new Error('Invalid credentials');
    const isMatched = await compare(password, user.password);
    if (!isMatched) throw new Error('Invalid credentials');
    return user;
  } catch (error) {
    error.name = 'Auth Error';
    throw error;
  }
};

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.accessToken;
  delete user.confirmToken;
  delete user.resetToken;
  delete user.createdAt;
  delete user.updatedAt;
  delete user.isConfirm;
  delete user.__v;
  return user;
};

const User = mongoose.model('users', UserSchema);
module.exports = User;
