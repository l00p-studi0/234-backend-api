/*eslint-disable*/
const userRoute = require("../core/routerConfig");
const userController = require("../controller/userController");
const { authenticate, permitSuperAdmin, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

userRoute
  .route("/users")
  .post(userController.signup)
  .get(authenticate, userController.getUserProfile)
  .put(authenticate, userController.updateUserDetails)
  .delete(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    userController.deleteUser
  );


userRoute
  .route("/users/change-user-type")
  .patch(authenticate, userController.changeUserType);

userRoute.route("/send-token").post(userController.sendToken);

userRoute
  .route("/users/all")
  .get(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    userController.getAllUser
  );

userRoute
  .route("/users/create-admin")
  .post(
    authenticate,
    permitSuperAdmin(ADMIN_ROLES.SUPER_ADMIN),
    userController.createAdmin
  );

userRoute.route("/users/login").post(userController.login);

userRoute.route("/users/reset-password").post(userController.resetPassword);

userRoute.route("/users/forgot-password").post(userController.forgotPassword);

userRoute
  .route("/users/upload-profile-image")
  .put(
    authenticate,
    upload.imageUpload.any(),
    userController.uploadProfileImage
  );

// get user wallet
userRoute
  .route("/users/wallet")
  .get(authenticate, userController.getUserWallet);

// get user wallet
userRoute.route("/users/verify").post(userController.activateUser);

// get all active apartments
userRoute
  .route("/users/apartments")
  .get(authenticate, userController.getActiveApartment);

// subcribe To Newsletter
userRoute
  .route("/users/subscribe")
  .post(userController.subcribeToNewsletter)
  .get(userController.getAllSubcribedUser);

// get user dashboard data
userRoute
  .route("/users/dashboarddata")
  .get(authenticate, userController.userDashboardData);

  userRoute
  .route("/users/:id")
  .delete(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    userController.deleteUser
  );

// get user by id
userRoute.route("/users/:id").get(authenticate, userController.getUser);

module.exports = userRoute;
