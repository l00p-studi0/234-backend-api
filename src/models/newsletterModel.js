
/*eslint-disable*/
const { Schema, model } = require("mongoose");

const newsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
      },
   
  }
);


const newsletterModel = model("newsletter", newsletterSchema);
module.exports = newsletterModel;
