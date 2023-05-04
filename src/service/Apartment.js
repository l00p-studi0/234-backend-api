/*eslint-disable*/
const ApartmentSchema = require("../models/apartmentModel");
const BookingSchema = require("../models/bookingModel");
const ApartmentWishlistSchema = require("../models/apartmentWishlistModel");
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const util = require("../utils/util");
const {
  BOOKING_STATUS,
} = require("../utils/constants");

class Apartment {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async createApartment() {
    const { isValid, messages } = validateParameters(
      [
        "userId",
        "apartmentName",
        "address",
        "apartmentCountry",
        "apartmentState",
        "price",
        "typeOfApartment",
        "facilities",
        "apartmentImages",
        "apartmentInfo",
        "numberOfBedrooms",
        "numberOfToilets",
        "longitude",
        "latitude",
        "landmark",
      ],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    this.data["apartmentName"] = this.data["apartmentName"].toLowerCase();
    this.data["apartmentCountry"] = this.data["apartmentCountry"].toLowerCase();
    this.data["apartmentState"] = this.data["apartmentState"].toLowerCase();
    return await new ApartmentSchema(this.data).save();
  }

  async getUserApartment() {
    return await ApartmentSchema.find({ userId: this.data }).orFail(() =>
      throwError("No Apartment Found", 404)
    );
  }

  async getSingleApartmentById() {
    return await ApartmentSchema.findById(this.data).orFail(() =>
      throwError("Apartment Not Found", 404)
    );
  }

  async getAllApartment() {
    const limit = this.data.limit
    const skip = this.data.skip
    return await ApartmentSchema.find({}, null, {skip: skip || 0, limit: limit || 10})
      .sort({ createdAt: -1 }).populate('userId')
      .orFail(() => throwError("No Apartment Found", 404));
  }

  async deleteApartment() {
    const { id, userId } = this.data;
    const apartment = await ApartmentSchema.findById(id).orFail(() =>
      throwError("Apartment Not Found", 404)
    );
    if (apartment.userId.toString() !== userId.toString()) {
      throwError("You are not authorized to delete this apartment");
    }
    return await apartment.remove();
  }

  async updateApartment() {
    const { newDetails, id, userId } = this.data;
    const apartment = await ApartmentSchema.findById(id).orFail(() =>
      throwError("Apartment Not Found", 404)
    );
    if (apartment.userId.toString() !== userId.toString()) {
      throwError("You are not authorized to update this apartment");
    }
    const updates = Object.keys(newDetails);
    const allowedUpdates = [
      "apartmentName",
      "apartmentName",
      "address",
      "apartmentCountry",
      "apartmentState",
      "price",
      "typeOfApartment",
      "facilities",
      "apartmentImages",
      "featuredImages",
      "apartmentInfo",
      "numberOfBedrooms",
      "numberOfToilets",
      "numberOfGuests",
      "longitude",
      "latitude",
      "landmark"
    ];
    newDetails.apartmentName = newDetails.apartmentName.toLowerCase();
    newDetails.apartmentCountry = newDetails.apartmentCountry.toLowerCase();
    newDetails.apartmentState = newDetails.apartmentState.toLowerCase();
    return await util.performUpdate(
      updates,
      newDetails,
      allowedUpdates,
      apartment
    );
  }

  async makeApartmentNotAvailable() {
    return await ApartmentSchema.findByIdAndUpdate(
      this.data.id,
      { isAvailable: this.data.isAvailable },
      { new: true }
    );
  }

  // search apartments
  async searchApartments() {
    const {
      state,
      type,
      check_in,
      check_out,
      country,
      location,
    } = this.data;

      const booking = await BookingSchema.find({
        bookingStatus: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
        checkInDate: { $lte: check_in},
        checkOutDate: { $gte: check_out},
      }).select(['dateList', 'apartmentId']);

      const bookingDateList = booking.map((booking) => {
        return booking.apartmentId;
      });
      const bookingDateListFlatten = bookingDateList.flat();
      const bookingDateListUnique = [...new Set(bookingDateListFlatten)];
     
      console.log(bookingDateListUnique);
    
    let query = {
      $or: [
        {
           address: new RegExp(location, 'i') ,
        },
        {
          apartmentCountry: country,
        },
        {
          apartmentState: state,
        },
        {
          typeOfApartment: new RegExp(type, 'i'),
        },
      ],
      $and: [
        {
          isAvailable: true,
        },
        {
          _id: { $nin: bookingDateListUnique }
        },
      ],
    };
  
   return await ApartmentSchema.find(query);
  }

  // get a all apartment near you based on location state and country
  async getApartmentsNearYou() {
    const { apartmentCountry, apartmentState } = this.data;
    return await ApartmentSchema.find({
      apartmentCountry,
      apartmentState,
    }).orFail(() => throwError("No Apartment Found", 404));
  }

  //wishlist apartment
  async saveApartment() {
    console.log(this.data);
    const { apartmentId, userId } = this.data;
    const check = await ApartmentWishlistSchema.findOne({ apartmentId, userId });
    console.log(check);
    if (check) {
      throwError("Apartment already saved for later");
    } 
      return await new ApartmentWishlistSchema({ apartmentId, userId }).save();
    
  }

   //get all user wishlist apartment
   async allSaveApartment() {
    console.log(this.data);
    const {userId} = this.data;
    console.log();
    return await ApartmentWishlistSchema.find(this.data).populate("apartmentId").orFail(()=> {
      throwError("No saved Apartment");
    });
    
  }

  //check apartment availability
  async checkApartmentAvailability() {
    const { apartmentId } = this.data;
    const apartmentBooking = await BookingSchema.findOne({
      apartmentId: apartmentId,
    });
    if (!apartmentBooking.isBooked) {
      throwError("Apartment already booked");
      console.log(apartmentBooking.isBooked);
    } else {
      return "Apartment is available to be booked";
    }
  }

  //get all Booked apartments
  async getAllBookedApartment() {
    const bookedApartment = await ApartmentSchema.find({ isAvailable: false });
    return bookedApartment;
  }

  //get all Available apartments
  async getAllAvailableApartment() {
    const availableApartment = await ApartmentSchema.find({
      isAvailable: true,
    });
    return availableApartment;
  }
}

module.exports = Apartment;
