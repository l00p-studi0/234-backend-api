/*eslint-disable*/
const UserSchema = require("../models/userModel");
const { throwError } = require("../utils/handleErrors");
const bcrypt = require("bcrypt");
const util = require("../utils/util");
const { validateParameters } = require("../utils/util");
const Wallet = require("./Wallet");
const WalletSchema = require("../models/walletModel");

const {
  accountVerificationEmail,
} = require("../utils/sendgrid");
const { ADMIN_ROLES, USER_TYPE, STATUS } = require("../utils/constants");
const Apartment = require("../models/apartmentModel");

class User {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  // admin can get all business host
  async getAllBusinessHost() {
    const businessHost = await UserSchema.find({ role: USER_TYPE.BUSINESS });
    return businessHost;
  }

  // admin can get all individual host
  async getAllIndividualHost() {
    const individualHost = await UserSchema.find({
      role: USER_TYPE.INDIVIDUAL,
    });
    return individualHost;
  }

  //verify host
  async verifyHost() {
    
    const { userId } = this.data;
    const verifyHost = await UserSchema.findOne({ _id: userId });
    verifyHost.isVerified = true;
    await verifyHost.save()
    await accountVerificationEmail(verifyHost.firstName, verifyHost.email)
    return verifyHost;
  }

  //suspend host
  async suspendHost() {
  const {userId} = this.data;
  const suspendHost = await UserSchema.findOne({ _id: userId });
  suspendHost.status = "SUSPENDED";
  return await suspendHost.save();
}
  async deleteAccount() {
    const {userId} = this.data;
    const findUser = await UserSchema.findOne({ _id: userId });
   if (findUser) {
    const deleteAccount = await UserSchema.deleteOne({ _id: userId })
    if (deleteAccount) return deleteAccount
   }
   
  }

  async suspendApartment() {
    const {apartmentId} = this.data;
  return await Apartment.findByIdAndUpdate({_id: apartmentId}, {status: STATUS.SUSPENDED});
    
  }

}
module.exports = User;
