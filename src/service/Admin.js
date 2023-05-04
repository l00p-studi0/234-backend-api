/*eslint-disable*/
const UserSchema = require("../models/userModel");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const { validateParameters } = require("../utils/util");
const Wallet = require("./Wallet");

const {
  sendResetPasswordToken,
  SuccessfulPasswordReset,
  sendEmailToken,
  accountVerificationEmail,
} = require("../utils/sendgrid");
const { ADMIN_ROLES, USER_TYPE, STATUS } = require("../utils/constants");
const Apartment = require("../models/productModel");
const Product = require("../models/productModel");

class Admin {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async emailExist() {
    const existingUser = await UserSchema.findOne({
      email: this.data.email,
    }).exec();
    if (existingUser) {
      this.errors.push("Email already taken");
      return { emailExist: true, user: existingUser };
    }
    return { emailExist: false };
  }

  async phoneNumberExist() {
    const findPhoneNumber = await UserSchema.findOne({
      phoneNumber: this.data.phoneNumber,
    }).exec();
    if (findPhoneNumber) {
      this.errors.push("Phone Number already taken");
      return true;
    }
    return false;
  }

  async signup() {
    const verificationCode1 = Math.floor(100000 + Math.random() * 100000);
    this.data.otp = verificationCode1;
    console.log(this.data.role);
    const { isValid, messages } = validateParameters(
      ["phoneNumber", "email", "password"],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }

    if (this.data.googleSigned === "false") {
      if (this.data.role === ADMIN_ROLES.ADMIN || this.data.role === ADMIN_ROLES.SUPER_ADMIN) {
        this.data.isVerified = false;
      }
    } else {
      if (this.data.role === ADMIN_ROLES.ADMIN || this.data.role === ADMIN_ROLES.SUPER_ADMIN) {
        this.data.isVerified = true;
      }
    }
    await Promise.all([this.emailExist(), this.phoneNumberExist()]);
    if (this.errors.length) {
      throwError(this.errors);
    }
    const newUser = await new UserSchema(this.data).save();
    await sendEmailToken(newUser.email, verificationCode1, newUser.firstName);
    return newUser;
  }

  async login() {
    const { loginId, password } = this.data;
    const validParameters = validateParameters(
      ["loginId", "password"],
      this.data
    );
    const { isValid, messages } = validParameters;

    if (!isValid) {
      throwError(messages);
    }
    return await UserSchema.findByCredentials(loginId, password);
  }

  async forgotPassword() {
    const { email } = this.data;
    const verificationCode = Math.floor(100000 + Math.random() * 100000);
    if (!email) {
      throwError("Please Input Your Email");
    }
    const updateUser = await UserSchema.findOneAndUpdate(
      {
        email,
      },
      { otp: verificationCode },
      { new: true }
    );
    if (!updateUser) {
      return throwError("Invalid Email");
    }
    if (updateUser.role === USER_TYPE.BUSINESS) {
      await sendResetPasswordToken(
        updateUser.email,
        updateUser.businessName,
        updateUser.otp
      );
    } else {
      await sendResetPasswordToken(
        updateUser.email,
        updateUser.firstName,
        updateUser.otp
      );
    }
    return updateUser;
  }

  async resetPassword() {
    const { otp, newPassword } = this.data;
    if (!otp || !newPassword) {
      throwError("Please Input Your Otp and New Password");
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    const updateUser = await UserSchema.findOneAndUpdate(
      {
        otp,
      },
      { otp: null, password: hashed },
      { new: true }
    );
    if (!updateUser) {
      throwError("Invalid Token");
    }
    await SuccessfulPasswordReset(updateUser.firstName, updateUser.email);
    return updateUser;
  }

 

}
module.exports = Admin;
