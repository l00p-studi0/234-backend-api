// /*eslint-disable*/
var axios = require("axios");
const FlutterSchema = require("../models/flutterModel");
const Flutterwave = require("flutterwave-node-v3");
const { FRONTEND_BASE_URL, FLW_SECRET_KEY } = require("../core/config");
const { throwError } = require("../utils/handleErrors");
const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

exports.initiatePaymentFlutterwave = async (
  amount,
  email,
  phone,
  name,
  userId,
  bookingId
) => {
  try {
    let data = JSON.stringify({
      tx_ref: "PS_" + Math.floor(Math.random() * 100000000 + 1),
      amount: amount,
      currency: "NGN",
      redirect_url: `${FRONTEND_BASE_URL}/user/dashboard/booking/:${bookingId}/payment-status?amount=${amount}`,
      customer: {
        email: email,
        phonenumber: phone,
        name: name,
      },
      meta: {
        booking_id: bookingId,
        user_id: userId,
      },
    });
    var config = {
      method: "post",
      url: "https://api.flutterwave.com/v3/payments",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        return response.data;
      })
      .catch(function (error) {
      });
  } catch (err) {
    console.log(err.message);
  }
};


exports.initiatePaymentFlutterwaveEvent = async (
  amount,
  email,
  phone,
  name,
  userId,
  eventId
) => {
  try {
    let data = JSON.stringify({
      tx_ref: "PS_" + Math.floor(Math.random() * 100000000 + 1),
      amount: amount,
      currency: "NGN",
      redirect_url: `${FRONTEND_BASE_URL}/event/approve-payment/:${eventId}/payment-status?amount=${amount}`,
      customer: {
        email: email,
        phonenumber: phone,
        name: name,
      },
      meta: {
        event_id: eventId,
        user_id: userId,
      },
    });
    var config = {
      method: "post",
      url: "https://api.flutterwave.com/v3/payments",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      data: data
    };

    return axios(config)
      .then(function (response) {
        console.log(response);
        return response.data;
      })
      .catch(function (error) {
      });
  } catch (err) {
    console.log(err.message);
  }
};

exports.flutterPaymentCallback = async (req, res) => {
  if (req.query.status === "successful") {
    console.log(req.query);
  }
};

// exports.verify = async () {

// }

exports.flutterVerification =  async (transaction_id) => {
 const response = await flw.Transaction.verify({ id: transaction_id })
    
      if (
        response.data.status == "successful" &&
        response.data.currency === "NGN"
      ) {
        // things you can save from flutterwave into your schema
        // let booking_id = response.data.meta.booking_id;
        // let status_ = response.data.status;
        // let amount =  response.data.amount;

        // //kindly save this correctly
        // const flutterDetails = new FlutterSchema({
        //   amount,
        //   status_,
        //   tx_ref,
        //   transaction_id,
        //   booking_id,
        // });
        // flutterDetails.save();

        console.log("Payment Successful");
        return response.data
      } else {
        // Inform the customer their payment was unsuccessful
        console.log("Payment Failed");
        throwError("Payment Failed")
      }
    
};
