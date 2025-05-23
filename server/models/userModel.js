const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const config = require('../config');

const { model, Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: function () {
        return this.authType === 'local';
      },
      validate: {
        validator: function (v) {
          return validator.isStrongPassword(v, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      },
    },
    authType: { type: String, default: 'local' },
    profilePicture: { type: String, default: '' },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      default: 'user',
    },
    phoneNumber: { type: String },
    whatsapp: { type: String },
    contactEmail: { type: String },
    active: { type: Boolean, default: true },
    savedProperties: { type: Array, default: [] },
    resetPasswordToken: { type: String },
    resetPasswordTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

// Middlewares
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Custom Methods
userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  hashedPassword
) {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordTokenExpiry = Date.now() + config.PASSWORD_RESET_EXPIRES_IN;
  return resetToken;
};

userSchema.methods.changedPasswordAfter = function (timestamp) {
  if (!this.passwordChangedAt) return false;
  return timestamp >= parseInt(this.passwordChangedAt.getTime() / 1000, 10);
};

const User = model('User', userSchema);

module.exports = User;
