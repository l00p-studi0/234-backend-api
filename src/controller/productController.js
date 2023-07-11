/*eslint-disable*/
const { error, success } = require("../utils/baseController");
const { logger } = require("../utils/logger");
const Product = require("../service/product");
const User = require("../service/User");

// create Product
exports.createProduct = async (req, res) => {
  try {
    // req.body["userId"] = req.user._id;
    await new Product(req.body).createProduct();
    return success(res, { message: "Product Created Successfully" });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getUserProduct = async (req, res) => {
  try {
    const Products = await new Product(req.user._id).getUserProduct();
    return success(res, { Products });
  } catch (err) {
    logger.error("Unable to get user Product", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    console.log({limit: req.query.limit, skip: req.query.skip});
    const Products = await new Product({limit: Number(req.query.limit), skip: Number(req.query.skip)}).getAllProduct();
    return success(res,  {Products});
  } catch (err) {
    logger.error("Unable to get all Products", err);
    return error(res, { code: err.code, message: err.message });
  }
};
// get Product by id
exports.getProductById = async (req, res) => {
  try {
    const product = await new Product(
      req.params.id
    ).getProductById();
    return success(res, { product });
  } catch (err) {
    logger.error("Unable to get Product", err);
    return error(res, { code: err.code, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const newDetails = req.body;
    // const userId = req.user._id;
    const updatedProduct = await new Product({
      newDetails,
      id,
      // userId,
    }).updateProduct();
    return success(res, { updatedProduct });
  } catch (err) {
    logger.error("Unable to complete host update request", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// delete Product
exports.deleteProduct = async (req, res) => {
  try {
    // const userId = req.user._id;
    const id = req.params.id;
    const product = await new Product({ id }).deleteProduct();
    return success(res, { product });
  } catch (err) {
    logger.error("Unable to delete Product", err);
    return error(res, { code: err.code, message: err.message });
  }
};


// search Products
exports.searchProducts = async (req, res) => {
  try {
    const products = await new Product(req.query ).searchProducts();
    return success(res, { products });
  } catch (err) {
    // logger.error("Unable to get all Products", err);
    return error(res, { code: err.code, message: err.message });
  }
};



// save Product
exports.saveProduct = async (req, res) => {
  try {
    req.body["userId"] = req.user._id;
  const savedProduct =  await new Product(req.body).saveProduct();
    return success(res, {savedProduct});
  } catch (err) {
    logger.error("Unable to save Product", err);
    return error(res, { code: err.code, message: err.message });
  }
};

// get all user saved Product
exports.AllsaveProduct = async (req, res) => {
  try {
    req.body["userId"] = req.user._id;
   const Product = await new Product(req.body).allSaveProduct();
    return success(res, {Product});
  } catch (err) {
    logger.error("Unable To fetch all saved Product", err.message);
    return error(res, { code: err.code, message: err.message });
  }
};


// get all the booked Products
exports.getAllBookedProduct = async (req, res) => {
  try {
    const Products = await new Product(req.params).getAllBookedProduct();
    return success(res, "success", Products);
  } catch (err) {
    logger.error("Unable to get all booked Products", err);
    return error(res, { code: err.code, message: err.message });
  }
};
// get all the available Products
exports.getAllAvailableProduct = async (req, res) => {
  try {
    const Products = await new Product(req.params).getAllAvailableProduct();
    return success(res, "success", Products);
  } catch (err) {
    logger.error("Unable to get all available Products", err);
    return error(res, { code: err.code, message: err.message });
  }
};
