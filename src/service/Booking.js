/*eslint-disable*/
const moment = require("moment");
const axios = require("axios");
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const BookingSchema = require("../models/bookingModel");
const FlutterSchema = require("../models/flutterModel");
const ledgerWalet = require("../service/ledgerWalet");
const {
  BOOKING_STATUS,
  NOTIFICATION_TYPE,
  TRANSACTION_TYPE,
  PAYMENT_STATUS,
} = require("../utils/constants");
const Notification = require("./Notification");
const Transaction = require("./Transaction");
const Wallet = require("./Wallet");
const {
  initiatePayment,
  verifyPayment,
} = require("../integration/paystackClient");
const {
  initiatePaymentFlutterwave,
  flutterVerification,
} = require("../integration/flutterwave");
const { bookingEmail } = require("../utils/sendgrid");

class Booking {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async createBooking() {
    const { isValid, messages } = validateParameters(
      [
        "items",
        "totalAmount",
        "quantity",
        "checkOutDate",
        "bookingUserEmail",
        "bookingUserAdress",
      ],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    
    return await new BookingSchema(this.data).save();
  }

  // all bookings
  async getAllBookings() {
    return await BookingSchema.find({})
      .sort({ createdAt: -1 })
      .populate("productId")
      .orFail(() => throwError("No Bookings Found", 404));
  }

  async getmostBookedListing() {
    const bookings = await BookingSchema.find({}).sort({ createdAt: -1 });
    let arr = [];
    bookings.forEach((element) => {
      arr.push(element.apartmentOwnerId);
    });
    var counts = {};
    var compare = 0;
    var mostFrequent;
    for (var i = 0, len = arr.length; i < len; i++) {
      var word = arr[i];

      if (counts[word] === undefined) {
        counts[word] = 1;
      } else {
        counts[word] = counts[word] + 1;
      }
      if (counts[word] > compare) {
        compare = counts[word];
        mostFrequent = arr[i];
      }
    }
    return mostFrequent;
  }

  // all bookings by user
  async getAllBookingsByUser() {
    return await BookingSchema.find({ bookingUserId: this.data })
      .sort({ createdAt: -1 })
      .populate(
        "apartmentId apartmentOwnerId bookingUserId"
      )
      .orFail(() => throwError("No Bookings Found", 404));
  }

  async getAllBookingsByBusinessOrIndividual() {
    return await BookingSchema.find({ apartmentOwnerId: this.data })
      .sort({ createdAt: -1 })
      .populate(
        "apartmentId apartmentOwnerId bookingUserId "
      )
      .orFail(() => throwError("No Bookings Found", 404));
  }

  // get booking by id
  async getBookingById() {
    return await BookingSchema.findById(this.data)
      .populate(
        "apartmentId apartmentOwnerId bookingUserId "
      )
      .orFail(() => throwError("No Booking Found", 404));
  }

  // get booking by apartment id
  async getBookingByApartmentId() {
    const booking = await BookingSchema.find({
      apartmentId: this.data,
      isBooked: false,
      bookingStatus: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      checkOutDate: { $gte: new Date() },
    });
    const bookingDateList = booking.map((booking) => {
      return booking.dateList;
    });
    const bookingDateListFlatten = bookingDateList.flat();
    const bookingDateListUnique = [...new Set(bookingDateListFlatten)];
    return bookingDateListUnique;
  }

  // cancel booking
  async cancelBooking() {
    const booking = await BookingSchema.findById(this.data).populate(
      "apartmentId bookingUserId"
    );
    if (!booking) {
      throwError("No Booking Found", 404);
    }
    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throwError("Booking is already confirmed or cancelled", 400);
    }
    booking.bookingStatus = BOOKING_STATUS.CANCELLED;
    const notificationDetails = {
      bookingUserId: booking.bookingUserId,
      bookingId: booking._id,
      message: `${booking.apartmentId.apartmentName} booking has been cancelled`,
      image: booking.apartmentId.apartmentImages[0],
      price: booking.bookingAmount,
      apartmentId: booking.apartmentId._id,
      notificationType: NOTIFICATION_TYPE.BOOKING_CANCELLATION,
    };
    Notification.createNotification(notificationDetails);
    return await booking.save();
  }

  // pay for pending booking
  async payForPendingBooking() {
    const { bookingId, paymentMethod, userId } = this.data;
    const booking = await BookingSchema.findById({ _id: bookingId }).populate(
      "apartmentId bookingUserId apartmentOwnerId apartmentName profilePicture apartmentImages companyName"
    );
    if (!booking) {
      throwError("No Booking Found", 404);
    }
    if (booking.bookingStatus !== BOOKING_STATUS.PENDING) {
      throwError("Booking is already confirmed or cancelled", 400);
    }
    if (paymentMethod === "WALLET") {
      const wallet = await new Wallet(userId).getUserWallet();
      if (wallet.availableBalance < booking.bookingAmount) {
        throwError("Insufficient balance in wallet", 400);
      }
      const transactionDetails = {
        userId: booking.bookingUserId,
        amount: booking.bookingAmount,
        reason: "Booking payment",
        type: TRANSACTION_TYPE.WITHDRAWAL,
        reference: "WD" + Date.now().valueOf() + "REF",
        paymentDate: new Date(),
      };
      await Transaction.createTransaction(transactionDetails);
      booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
      booking.paymentMethod = paymentMethod;
      booking.isBooked = true;
      const notificationDetailsUser = {
        bookingUserId: booking.bookingUserId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      Notification.createNotification(notificationDetailsUser);
      const notificationDetailsBusinessAndIndividual = {
        apartmentOwnerId: booking.apartmentId.userId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      Notification.createNotification(notificationDetailsBusinessAndIndividual);
      wallet.availableBalance -= booking.bookingAmount;
      await wallet.save();
      booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
      booking.paymentDate = new Date();
      booking.bookingOrderId = "BK" + Date.now().valueOf() + "REF";
      await bookingEmail(
        booking.bookingUserId.fullName,
        booking.bookingUserId.email,
        booking.bookingUserId.phonenumber,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      await bookingEmail(
        booking.apartmentOwnerId.fullName ||
          booking.apartmentOwnerId.companyName,
        booking.apartmentOwnerId.email,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      return await booking.save();
    } else if (paymentMethod === "FLUTTERWAVE") {
      let checkOut = await initiatePaymentFlutterwave(
        booking.bookingAmount,
        booking.bookingUserId.email,
        booking.bookingUserId.phoneNumber,
        booking.bookingUserId.firstName,
        booking.bookingUserId._id,
        booking._id
      );
      if (checkOut) {
        return checkOut.data.link;
      }
    }
  }

  async verifyBooking() {
    const { transaction_id } = this.data;

    // verify if the incoming booking id is present in the flutterschema(Payment information wey we save)
    const flutter = await flutterVerification(transaction_id);
    if ( flutter.status === 'successful') {
      const booking = await BookingSchema.findOne({
        _id: flutter.meta.booking_id,
      }).populate(
        "apartmentId bookingUserId apartmentOwnerId"
      );
      if (booking) {
      const paymentDate = flutter.created_at;
      booking.bookingStatus = BOOKING_STATUS.CONFIRMED;
      booking.paymentStatus = PAYMENT_STATUS.SUCCESS;
      booking.isBooked = true;
          await booking.save()
      const transactionDetails = {
        userId: booking.bookingUserId,
        amount: booking.bookingAmount,
        reason: "Booking payment",
        type: TRANSACTION_TYPE.WITHDRAWAL,
        reference: "WD" + Date.now().valueOf() + "REF",
        paymentDate,
      };
      console.log({booking});
      await Transaction.createTransaction(transactionDetails);
      const LedgerWallet = await new ledgerWalet({
        userId: booking.apartmentOwnerId,
      }).createWallet();
      LedgerWallet.availableBalance += booking.bookingAmount;
      console.log(LedgerWallet);
      await LedgerWallet.save();
      const notificationDetailsUser = {
        bookingUserId: booking.bookingUserId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      await Notification.createNotification(notificationDetailsUser);

      const notificationDetailsBusinessAndIndividual = {
        apartmentOwnerId: booking.apartmentId.userId,
        bookingId: booking._id,
        message: `${booking.apartmentId.apartmentName} booking has been confirmed`,
        image: booking.apartmentId.apartmentImages[0],
        price: booking.bookingAmount,
        apartmentId: booking.apartmentId._id,
        notificationType: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
      };
      await Notification.createNotification(
        notificationDetailsBusinessAndIndividual
      );

      await bookingEmail(
        booking.bookingUserId.firstName,
        booking.bookingUserId.email,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      await bookingEmail(
        booking.apartmentOwnerId.firstName ||
          booking.apartmentOwnerId.companyName,
        booking.apartmentOwnerId.email,
        booking.apartmentId.apartmentName,
        booking.checkInDate,
        booking.checkOutDate,
        booking.bookingAmount,
        booking.bookingOrderId
      );
      return flutter;
    }
    throwError(`Booking With Transaction Id Not Found`)
    } else {
      throwError(`Payment failed for this booking. Please Try again`, 400);
    }
  }
}
module.exports = Booking;
