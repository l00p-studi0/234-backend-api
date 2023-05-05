/*eslint-disable*/
const productRoute = require("../core/routerConfig");
const productController = require("../controller/productController");
const { authenticate, permit } = require("../core/userAuth");
const { ADMIN_ROLES, USER_TYPE } = require("../utils/constants");

productRoute
  .route("/products")
  .post(
    authenticate,
    permit([ADMIN_ROLES.ADMIN,ADMIN_ROLES.SUPER_ADMIN]),
    productController.createProduct
  );

 // get all products 
 productRoute
 .route("/products/all-products")
 .get(productController.getAllProduct
 );



//search product
productRoute
.route("/products-one/search")
.get(productController.searchProducts)



//save product
  productRoute
  .route("/products/save-product")
  .post(
    authenticate,
    // permit([ADMIN_ROLES.ADMIN,ADMIN_ROLES.SUPER_ADMIN]),
    productController.saveProduct
  );

  //get all saved user product
  productRoute
  .route("/products/save-product/all")
  .get(
    authenticate,
    // permit([ADMIN_ROLES.ADMIN,ADMIN_ROLES.SUPER_ADMIN]),
    productController.AllsaveProduct
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
  authenticate,
  permit([ADMIN_ROLES.ADMIN,ADMIN_ROLES.SUPER_ADMIN]),
  productController.deleteProduct
);

// update product by id
productRoute
.route("/products/:id")
.put(
  authenticate,
  permit([ADMIN_ROLES.ADMIN,ADMIN_ROLES.SUPER_ADMIN]),
  productController.updateProduct
);




module.exports = productRoute;
