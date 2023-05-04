/*eslint-disable*/
const walletRoute = require("../core/routerConfig");
const walletController = require("../controller/ledgerWalletController");
const { authenticate, permit } = require("../core/userAuth");
const { USER_TYPE } = require("../utils/constants");

walletRoute
  .route("/withdrawable-wallet")
  .get(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    walletController.getUserWallet
  );

walletRoute
  .route("/withdrawable-wallet/fund-wallet")
  .put(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    walletController.fundWallet
  );

walletRoute
  .route("/withdrawable-wallet/withdrawal")
  .put(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    walletController.withdrawFund
  );


// verify fund wallet
walletRoute
  .route("/withdrawable-wallet/verify-fund-wallet/:reference")
  .get(
    authenticate,
    permit(Object.keys(USER_TYPE)),
    walletController.verifyFundTransfer
  );

module.exports = walletRoute;
