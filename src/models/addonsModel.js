const mongoose = require('mongoose')
const uniqueValidator = require("mongoose-unique-validator");
const { BOOKING_STATUS, SERVICE_TYPE, CARCondition } = require("../utils/constants");

const Schema = new mongoose.Schema({
 userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      address: {
        type: String,
        required: true
      },
      serviceType: {
        type: String,
        enum: Object.keys(SERVICE_TYPE),
        required: true
      },
      status: {
        type: String,
        default: BOOKING_STATUS.PENDING,
        enum: Object.keys(BOOKING_STATUS),
      },
      amenities: {
        type: Array,
        default: []
      },
       createdAt: {
        type: Date,
        default: Date.now(),
      },
      destination: {
        type: String
      },
      pickUpDate: {
        type: String
      },
      pickUpTime: {
        type: String
      },
      deliveryDate: {
        type: String
      },
      deliveryTime: {
        type: String
      }
})

Schema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const addonsModel = new mongoose.model('addons', Schema)
module.exports = addonsModel