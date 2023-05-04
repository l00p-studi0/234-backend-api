/*eslint-disable*/
const productRoute = require("../core/routerConfig");
const productController = require("../controller/productController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");

productRoute
  .route("/products")
  .post(
    // authenticate,
    // permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
    productController.createProduct
  );

 // get all products 
 productRoute
 .route("/products/all-products")
 .get(productController.getAllProduct
 );

// get user product
productRoute
  .route("/products/user")
  .get(
    // authenticate,
    // permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
    productController.getUserProduct
  );

// user can make product not available
productRoute
  .route("/products/available/status")
  .put(
    // authenticate,
    // permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
    productController.makeProductNotAvailable
  );

//search product
productRoute
.route("/products-one/search")
.get(productController.searchProducts)

// get all products near you
productRoute
  .route("/products/near/you")
  .get(
    // authenticate,
     productController.getProductsNearYou);

//save product
  productRoute
  .route("/products/save-product")
  .post(
    // authenticate,
    // permit([USER_TYPE.USER,USER_TYPE.BUSINESS,USER_TYPE.INDIVIDUAL]),
    productController.saveProduct
  );

  //get all saved user product
  productRoute
  .route("/products/save-product/all")
  .get(
    // authenticate,
    // permit([USER_TYPE.USER,USER_TYPE.BUSINESS,USER_TYPE.INDIVIDUAL]),
    productController.AllsaveProduct
  );


  //check product availability
productRoute
.route("/products/is-available")
.post(
 productController.checkProductAvailability
);

 // get all booked products 
 productRoute
 .route("/products/bookedproducts")
 .get(productController.getAllBookedProduct
 );

// get all available products 
productRoute
.route("/products/availableproducts")
.get(productController.getAllAvailableProduct
);

 
 // get product by id
productRoute
.route("/products/:id")
.get(productController.getProductById
);


// delete product by id
productRoute
.route("/products/:id")
.delete(
  // authenticate,
  // permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
  productController.deleteProduct
);

// update product by id
productRoute
.route("/products/:id")
.put(
  // authenticate,
  // permit([USER_TYPE.BUSINESS, USER_TYPE.INDIVIDUAL]),
  productController.updateProduct
);




module.exports = productRoute;
