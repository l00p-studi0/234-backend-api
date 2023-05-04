/*eslint-disable*/
const UserSchema = require("../models/userModel");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const { validateParameters } = require("../utils/util");
const Wallet = require("./Wallet");
const WalletSchema = require("../models/walletModel");
const ApartmentSchema = require("../models/apartmentModel");
const ApartmentWishlistSchema = require("../models/apartmentWishlistModel");
const {
  sendResetPasswordToken,
  SuccessfulPasswordReset,
  registrationSuccessful,
  sendEmailVerificationToken,
  sendEmailToken,
} = require("../utils/sendgrid");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const { decodeJwtToken, verifyToken } = require("../core/userAuth");
const newsletterModel = require("../models/newsletterModel");
throwError;

class User {
  constructor(data) {
    this.data = data;
    console.log(data);
    this.errors = [];
  }

  getUserWithPhoneEmail() {
    const user = UserSchema.findOne({
      $or: [{ phoneNumber: this.data }, { email: this.data }],
    });
    return user ? user : throwError("Individual Not Found", 404);
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
    const { isValid, messages } = validateParameters(
      ["phoneNumber", "email", "password"],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }

    if (this.data.googleSigned === "false") {
      if (this.data.role === USER_TYPE.USER) {
        this.data.isVerified = false;
      }
    } else {
      if (this.data.role === USER_TYPE.USER) {
        this.data.isVerified = true;
      }
    }
    await Promise.all([this.emailExist(), this.phoneNumberExist()]);
    if (this.errors.length) {
      throwError(this.errors);
    }
    const newUser = await new UserSchema(this.data).save();
    const wallet = await new Wallet({ userId: newUser._id }).createWallet();
    if (newUser.role !== USER_TYPE.USER) {
      wallet.withdrawableBalance = 0;
      wallet.save();
    }
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

  async createAdmin() {
    const otp = this.data.otp;
    const { isValid, messages } = validateParameters(
      ["phoneNumber", "email", "password"],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    if (this.data.googleSigned === "false") {
      if (!otp) {
        throwError("OTP Required To Complete Signup");
      }
    }
    await Promise.all([this.emailExist(), this.phoneNumberExist()]);
    if (this.errors.length) {
      throwError(this.errors);
    }

    const newUser = await new UserSchema(this.data).save();
    if (
      newUser.role === ADMIN_ROLES.ADMIN ||
      newUser.role === ADMIN_ROLES.SUPER_ADMIN
    ) {
      newUser.isVerified = true;
      await newUser.save();
    }

    return newUser;
  }

  async activateUser() {
    const { token } = this.data;
    if (!token) {
      throwError("Please Input Your Token");
    }
    // const one = await UserSchema.findOne({})
    const updateUser = await UserSchema.findOneAndUpdate(
      {
        otp: token,
      },
      { otp: null, isVerified: true },
      { new: true }
    );
    if (!updateUser) {
      throwError("Invalid Token");
    }
    // await  registrationSuccessful(updateUser.firstName, updateUser.email);
    return updateUser;
  }

  static async getAllUser() {
    return await UserSchema.find()
      .sort({ createdAt: -1 })
      .orFail(() => throwError("No event found"));
  }

  async userProfile() {
    return await UserSchema.findById(this.data).orFail(() =>
      throwError("No user found")
    );
  }

  async changeUserType() {
    const { _id, validId, businessName, companyAddress } = this.data;
    const user = await UserSchema.findOneAndUpdate(
      { _id },
      { role: USER_TYPE.INDIVIDUAL, isVerified: false, validId, companyAddress, businessName }
    );
    return user;
  }

  async updateUserDetails() {
    const { newDetails, oldDetails } = this.data;
    const updates = Object.keys(newDetails);
    const allowedUpdates = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "state",
      "country",
      "city",
      "gender",
      "companyName",
      "companyAddress",
      "profilePicture",
      "validId",
      "cacDocument",
      "businessName",
      "businessAddress",
    ];
    return await util.performUpdate(
      updates,
      newDetails,
      allowedUpdates,
      oldDetails
    );
  }

  async sendToken() {
    const { email } = this.data;
    const user = await UserSchema.findOne({ email });
    const verificationCode1 = Math.floor(100000 + Math.random() * 100000);
    user.otp = verificationCode1
     await sendEmailToken(email, verificationCode1, user.firstName);
     return await user.save()
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

  //delete a user from the database
  async deleteUser() {
    //delete user wallet
    const user = await UserSchema.deleteOne({ _id: this.data });

    if (user) await WalletSchema.deleteOne({ userId: this.data });
    return user.deletedCount;
  }

  //get user wallet
  async getUserWallet() {
    return await WalletSchema.findOne({ userId: this.data }).orFail(() =>
      throwError("User Not Found", 404)
    );
  }

  // user can see all active and available apartments
  async getActiveApartment() {
    const apartments = await ApartmentSchema.find({
      isAvailable: true,
      isActive: true,
    });
    return apartments;
  }

  // get user by id
  async getUser() {
    return await UserSchema.findById(this.data).orFail(() =>
      throwError("User Not Found", 404)
    );
  }

  //get user dashboard apartment details
  async getUserDashboardData() {
    //get all booked apartments by logged in user
    const bookedApartment = await ApartmentSchema.find({
      isAvailable: false,
      userId: this.data,
    }).countDocuments();

    //get all available apartment by logged in user
    const availableApartment = await ApartmentSchema.find({
      isAvailable: true,
    }).countDocuments();

    //get all wishlisted or saved apartments by loged in user
    const wishlistedApartment = await ApartmentWishlistSchema.find({
      userId: this.data,
    }).countDocuments();

    //get all active apartment by logged in user
    const activeApartments = await ApartmentSchema.find({
      isAvailable: true,
      isActive: true,
    }).countDocuments();

    const data = {
      all_booked_apartment: bookedApartment,
      all_available_apartment: availableApartment,
      all_saved_apartments: wishlistedApartment,

      all_active_apartments: activeApartments,
    };

    return data;
  }

  async subcribeToNewsletter() {
    const { email, name } = this.data;
    return await new newsletterModel({ email, name }).save();
  }

  async getAllSubcribedUser() {
    return await newsletterModel
      .find({})
      .orFail(() => {
        throwError("Subscribed User Not Found", 404);
      })
      .exec();
  }
}

module.exports = User;
