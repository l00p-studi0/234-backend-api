/*eslint-disable*/
const productSchema = require("../models/productModel");
const productWishlistSchema = require("../models/productWishlistModel");
const { throwError } = require("../utils/handleErrors");
const { validateParameters } = require("../utils/util");
const util = require("../utils/util");
const {
  BOOKING_STATUS,
} = require("../utils/constants");

class product {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  async createProduct() {
    const { isValid, messages } = validateParameters(
      [
        "Name",
        "Description",
        "Size",
        "Price",
        "Category",
        "featuredImages"
      ],
      this.data
    );
    if (!isValid) {
      throwError(messages);
    }
    return await new productSchema(this.data).save();
  }

  async getProductById() {
    return await productSchema.findById(this.data).orFail(() =>
      throwError("product Not Found", 404)
    );
  }

  async getAllProduct() {
    const limit = this.data.limit
    const skip = this.data.skip
    return await productSchema.find({}, null, {skip: skip || 0, limit: limit || 10})
      .sort({ createdAt: -1 })
      .orFail(() => throwError("No product Found", 404));
  }

  async deleteProduct() {
    const { id, userId } = this.data;
    return await productSchema.deleteOne({_id: id}).orFail(() =>
      throwError("product Not Found", 404)
    );
     
  }

  async updateProduct() {
    const { newDetails, id, userId } = this.data;
    const product = await productSchema.findById(id).orFail(() =>
      throwError("product Not Found", 404)
    );
    const updates = Object.keys(newDetails);
    const allowedUpdates = [
        "Name",
        "Description",
        "Size",
        "Price",
        "Category",
        "featuredImages"
    ];
    return await util.performUpdate(
      updates,
      newDetails,
      allowedUpdates,
      product
    );
  }

  async makeproductNotAvailable() {
    return await productSchema.findByIdAndUpdate(
      this.data.id,
      { isAvailable: this.data.isAvailable },
      { new: true }
    );
  }

  // search products
  async searchProducts() {
    const {
      Name,
      Price,
      Category,
      Size,
    } = this.data;
    
    let query = {
      $or: [
        {
           Name: new RegExp(Name, 'i') ,
        },
        {
          Size
        },
        {
          Price
        },
        {
          Category
        },
      ],
      $and: [
        {
          Available: true,
        }
      ],
    };
  
   return await productSchema.find(query);
  }

 

  //wishlist product
  async saveproduct() {
    console.log(this.data);
    const { productId, userId } = this.data;
    const check = await productWishlistSchema.findOne({ productId, userId });
    console.log(check);
    if (check) {
      throwError("product already saved for later");
    } 
      return await new productWishlistSchema({ productId, userId }).save();
    
  }

   //get all user wishlist product
   async allSaveproduct() {
    console.log(this.data);
    const {userId} = this.data;
    console.log();
    return await productWishlistSchema.find(this.data).populate("productId").orFail(()=> {
      throwError("No saved product");
    });
    
  }

  

  //get all Booked products
  async getAllBookedproduct() {
    const bookedproduct = await productSchema.find({ isAvailable: false });
    return bookedproduct;
  }

  //get all Available products
  async getAllAvailableProduct() {
    const availableproduct = await productSchema.find({
      Available: true,
    });
    return availableproduct;
  }
}

module.exports = product;
