const { Schema, model } = require("mongoose");
const bookingId = require("../models/flutterModel")
const uniqueValidator = require("mongoose-unique-validator");
const { BOOKING_STATUS, PAYMENT_STATUS } = require("../utils/constants");

const bookingSchema = new Schema(
  {
    bookingUserAddress: {
      type: String,
      required: true,
    },
    bookingUserPhone: {
      type: String,
      required: true,
    },
    bookingUserEmail: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true
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

bookingSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const BookingModel = model("Booking", bookingSchema);
module.exports = BookingModel;
