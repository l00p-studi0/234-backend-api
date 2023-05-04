
/*eslint-disable*/
const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { STATUS } = require("../utils/constants");

const apartmentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  apartmentName: {
    type: String,
    required: true,
  },
  apartmentState: {
    type: String,
    required: true,
  },
  apartmentCountry: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  typeOfApartment: {
    type: String,
    required: true,
  },
  facilities: {
    type: Array,
  },
  apartmentInfo: {
    type: String,
    required: true,
  },
  apartmentImages: {
    type: Array,
    required: true,
  },
  featuredImages: {
    type: Array,
  },
  dateList: {
    type: Array,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  numberOfToilets: {
    type: Number,
    required: true,
  },
  numberOfBedrooms: {
    type: Number,
    required: true,
  },
  numberOfGuests: {
    type: Number,
    required: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  landmark: {
    type: Array,
    required: true,
  },
  status: {
    type: String,
    enum: Object.keys(STATUS),
    default: STATUS.ACTIVE
  }
});

apartmentSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const Apartment = model("Apartment", apartmentSchema);
module.exports = Apartment;
