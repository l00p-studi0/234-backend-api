const addons = require('../controller/addonsController')
const addonsRoute = require("../core/routerConfig");
const { authenticate, permit } = require("../core/userAuth");


addonsRoute.route('/addons').post(authenticate, addons.bookAddOns).get(authenticate, addons.getAllService)

addonsRoute.route('/addons/booked').get(authenticate, addons.getBookedAllService)

addonsRoute.route('/addons/:id').get(authenticate, addons.getServiceById)

addonsRoute.route('/addons/cancel-service/:id').patch(authenticate, addons.cancelAddOnsService)


module.exports = addonsRoute