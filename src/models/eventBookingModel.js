const { Schema, model } = require("mongoose");
const bookingId = require("../models/flutterModel")
const uniqueValidator = require("mongoose-unique-validator");
const { BOOKING_STATUS, PAYMENT_STATUS } = require("../utils/constants");

const EventbookingSchema = new Schema(
  {
    bookingUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingEventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        index: true,
      },
    bookingStatus: {
      type: String,
      enum: Object.keys(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    bookingAmount: {
      type: Number,
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    numberOfReservation: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paymentMethod: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: Object.keys(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    paymentDate: {
      type: Date,
    },
  },
  {
    strictQuery: "throw",
  }
);

EventbookingSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const EventBookingModel = model("EventBooking", EventbookingSchema);
module.exports = EventBookingModel;
