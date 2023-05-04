/*eslint-disable*/
const { error, success } = require("../utils/baseController");
const { generateAuthToken } = require("../core/userAuth");
const { logger } = require("../utils/logger");
const { USER_TYPE } = require("../utils/constants");
const User = require("../service/User");

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
exports.changeUserType = async (req,res) => {
  try {
  const _id = req.user._id
    const user = await new User({ _id, ...req.body }).changeUserType()
    if (user) return success(res, {user})
  } catch (err) {
    logger.error("Error occurred at changeUserType", err.message);
    return error(res, { code: err.code, message: err.message });
  }
}
exports.login = async (req, res) => {
  try {
    const userDetails = await new User(req.body).login();
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

exports.createAdmin = async (req, res) => {
  try {
    const newUser = await new User(req.body).createAdmin();
    console.log('NEWUSER',newUser);
    newUser.isVerified = true
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

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.getAllUser();
    return success(res, { users });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await new User(req.user._id).userProfile();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete fetch user profile request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.updateUserDetails = async (req, res) => {
  try {
    const newDetails = req.body;
    const oldDetails = req.user;
    const user = await new User({ newDetails, oldDetails }).updateUserDetails();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete user update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const originalname = req.files[0].originalname;
    const path = req.files[0].path;
    const userId = req.user._id;
    const user = await new User({
      originalname,
      path,
      userId,
    }).uploadProfileImage();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await new User(userId).deleteUser();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.sendToken = async (req, res) => {
  try {
    const email = await new User({email: req.body.email}).sendToken()
    return res.status(200).json( {
      message: `OTP Message sent to ${req.body.email} successfully`,
      data: "success",
      status: 200,
    });
  } catch (error) {
    return res.status(error.status).json(error);
  }
}

exports.forgotPassword = (req, res) => {
  new User(req.body)
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

// get user wallet
exports.getUserWallet = async (req, res) => {
  try {
    const user = await new User(req.user._id).getUserWallet();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get all active apartments
exports.getActiveApartment = async (req, res) => {
  try {
    const apartments = await new User().getActiveApartment();
    return success(res, { apartments });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get all user dashboard data
exports.userDashboardData = async (req, res) => {
  try {
    const dashboardData = await new User(req.user._id).getUserDashboardData();
    return success(res, { dashboardData });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get user by id
exports.getUser = async (req, res) => {
  try {
    const user = await new User(req.params.id).getUser();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.activateUser = async(req, res) =>{
  try {
    const user = await new User(req.body).activateUser();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
}

exports.subcribeToNewsletter = async(req, res) =>{
  try {
    const user = await new User(req.body).subcribeToNewsletter();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
}

exports.getAllSubcribedUser = async(req, res) =>{
  try {
    const user = await new User().getAllSubcribedUser();
    return success(res, { user });
  } catch (err) {
    logger.error("Unable to complete request", err);
    return error(res, { code: err.code, message: err.message });
  }
}