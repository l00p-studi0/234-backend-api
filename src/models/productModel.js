
/*eslint-disable*/
const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const { STATUS } = require("../utils/constants");

const ProductSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  Category: {
    type: String,
    required: true,
  },
  Price: {
    type: String,
    required: true,
  },
  Size: {
    type: Array,
    required: true,
  },
  Color: {
    type: Array,
    required: true,
  },
  Available: {
    type: Boolean,
    required: true,
    default: true
  },
  quantity: {
    type: String,
    required: true,
    default: '1'
  },
  featuredImages: {
    type: Array,
    required: true,
  },
});

ProductSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const Product = model("Product", ProductSchema);
module.exports = Product;
