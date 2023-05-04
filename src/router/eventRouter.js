const eventRoute = require("../core/routerConfig");
const eventController = require("../controller/eventController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES } = require("../utils/constants");

// create event
eventRoute
  .route("/events/create-event")
  .post(authenticate, permit([ADMIN_ROLES.ADMIN]), eventController.createEvent);


// get all events
eventRoute.route("/events").get(eventController.getAllEvents);


// create event booking
eventRoute.route("/events/pay-for-event").get(authenticate, eventController.payForEvent);

eventRoute.route("/events/verify-event-payment").get(authenticate, eventController.verifyEventPayment);

// get event by location
eventRoute
  .route("/events/:location")
  .get( eventController.getEventByLocation);

// update event by id
eventRoute
  .route("/events/:id")
  .patch(
    authenticate,
    permit([ADMIN_ROLES.ADMIN]),
    eventController.updateEventById
  );

// delete event by id
eventRoute
  .route("/events/:id")
  .delete(
    authenticate,
    permit([ADMIN_ROLES.ADMIN]),
    eventController.deleteEventById
  );

  // get event by id
eventRoute.route("/events/one/:id").get( eventController.getEventById);



module.exports = eventRoute;
