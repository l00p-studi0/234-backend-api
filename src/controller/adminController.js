const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const { ADMIN_ROLES } = require("../utils/constants");
const Admin = require("../service/Admin");


exports.signup = async (req, res) => {
  try {
    const newUser = await new User(req.body).signup();
    const token = await generateAuthToken({
      userId: newUser._id,
      isVerified: newUser.isVerified,
      role: newUser.role,
    });
    return success(res, { newUser, token });
  } catch (err) {
    logger.error("Error occurred at signup", err);
    return error(res, { code: err.code, message: err });
  }
};

exports.login = async (req, res) => {
  try {
    const userDetails = await new Admin(req.body).login();
    const token = await generateAuthToken({
      userId: userDetails._id,
      isVerified: userDetails.isVerified,
      role: userDetails.role,
    });
    return success(res, { userDetails, token });
  } catch (err) {
    logger.error("Error occurred at login", err.message);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.forgotPassword = (req, res) => {
  new Admin(req.body)
    .forgotPassword()
    .then((data) =>
      success(res, {
        status: "success",
        success: true,
        message: "Token Has Been Sent To Your Email",
      })
    )
    .catch((err) => error(res, { code: err.code, message: err.message }));
};

exports.resetPassword = (req, res) => {
  new User(req.body)
    .resetPassword()
    .then((data) =>
      success(res, {
        status: "success",
        success: true,
        message: "Password Reset Successful",
      })
    )
    .catch((err) => error(res, { code: err.code, message: err.message }));
};

exports.getAllIndividualHost = async (req, res) => {
    try {
      const individualHost = await new Admin(req.params).getAllIndividualHost();
      console.log("funmi",req.params);
      return success(res, { individualHost });
    } catch (err) {
        console.log(err)
      logger.error("Unable to complete request", err);
      return error(res, { code: err.code, message: err.message });
    }
  };
  
exports.getAllBusinessHost = async (req, res) => {
  try {
    const businessHost = await new Admin( req.params ).getAllBusinessHost();
    return success(res, { businessHost });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.verifyHost = async (req, res) => {
    try {
      const verifyHost = await new Admin({userId: req.query.id}).verifyHost();
      return success(res, { status: success, verifyHost });
    } catch (err) {
      logger.error("Unable to verfiy host", err);
      return error(res, { code: err.code, message: err.message });
    }
  };

  exports.suspendHost = async (req, res) => {
    try {
      const suspendHost = await new Admin({userId: req.query.id}).suspendHost();
     if (suspendHost) return success(res, { status: success, suspendHost });
     return error(res, { code: err.code, message: 'user id not found' });
    } catch (err) {
      logger.error("Unable to suspend host", err);
      return error(res, { code: 400, message: err.message });
    }
  }

  exports.deleteAccount = async (req, res) => {
    try {
      const deleteAccount = await new Admin({userId: req.query.id}).deleteAccount();
     if (deleteAccount) return success(res, { status: success, deleteAccount });
     return error(res, { code: 400, message: 'user not found' });
    } catch (err) {
      logger.error("Unable to delete account", err);
      return error(res, { code: err.code, message: err.message });
    }
  }

  exports.suspendApartment = async (req, res) => {
    try {
      const apartment = await new Admin({apartmentId: req.query.apartmentId}).suspendApartment();
     if (apartment) return success(res, { apartment });
     return error(res, { code: 400, message: 'apartment not found' });
    } catch (err) {
      logger.error("Unable to delete account", err);
      return error(res, { code: err.code, message: err.message });
    }
  }

  exports.subcribeToNewsletter = async(req, res) =>{
    try {
      const user = await new Admin(req.body).subcribeToNewsletter();
      return success(res, { user });
    } catch (err) {
      logger.error("Unable to complete request", err);
      return error(res, { code: err.code, message: err.message });
    }
  }
  
  exports.getAllSubcribedUser = async(req, res) =>{
    try {
      const user = await new Admin().getAllSubcribedUser();
      return success(res, { user });
    } catch (err) {
      logger.error("Unable to complete request", err);
      return error(res, { code: err.code, message: err.message });
    }
  }