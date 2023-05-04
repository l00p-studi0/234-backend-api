/*eslint-disable*/
const adminRoute = require("../core/routerConfig");
const adminController = require("../controller/adminController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");
const upload = require("../core/multer");

adminRoute
  .route("/admin/allbusiness")
  .get(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    adminController.getAllBusinessHost
  );

  adminRoute
  .route("/admin/allindividual")
  .get(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    adminController.getAllIndividualHost
  );

  adminRoute
  .route("/admin/verifyhost")
  .patch(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    adminController.verifyHost
  );

  adminRoute
  .route("/admin/suspendhost")
  .patch(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    adminController.suspendHost
  );

  adminRoute
  .route("/admin/suspendApartment")
  .patch(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    adminController.suspendApartment
  );

  adminRoute
  .route("/admin/deleteAccount")
  .delete(
    authenticate,
    permit([ADMIN_ROLES.ADMIN, ADMIN_ROLES.SUPER_ADMIN]),
    adminController.deleteAccount
  );
  module.exports = adminRoute;