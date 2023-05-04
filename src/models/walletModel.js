
/*eslint-disable*/
const { Schema, model } = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
    },
    frozen: {
      type: Boolean,
      default: false,
    },  
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  }
);

walletSchema.plugin(uniqueValidator, { message: "{TYPE} must be unique." });

const walletModel = model("Wallet", walletSchema);
module.exports = walletModel;
