const express = require("express");
const router = express.Router();

// Require controller modules.
const product_controller = require("../controllers/productController");
const instrument_controller = require("../controllers/instrumentController");
const brand_controller = require("../controllers/brandController");

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + new Date().toISOString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  let valid = ['image/png', 'image/jpg', 'image/jpeg'];
  if (valid.includes(file.mimetype)) 
    cb(null, true)
  else
    cb(null, false)
}

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 8,
  },
  fileFilter: fileFilter, 
});

/// PRODUCT ROUTES ///

// GET catalog home page.
router.get("/", product_controller.index);

// GET request for creating a product. NOTE This must come before routes that display Book (uses id).
router.get("/product/create", product_controller.product_create_get);

// POST request for creating product.
router.post("/product/create", upload.single('productImage'), product_controller.product_create_post);

// GET request to delete product.
router.get("/product/:name/:id/delete", product_controller.product_delete_get);

// POST request to delete product.
router.post("/product/:name/:id/delete", product_controller.product_delete_post);

// GET request to confirm delete product.
router.get("/product/:name/:id/delete/password", product_controller.product_delete_password_get);

// POST request to confirm delete product.
router.post("/product/:name/:id/delete/password", product_controller.product_delete_password_post);

// GET request to update product.
router.get("/product/:name/:id/update", product_controller.product_update_get);

// POST request to update product.
router.post("/product/:name/:id/update", product_controller.product_update_post);

// GET request for one product.
router.get("/product/:name/:id", product_controller.product_detail);

// GET request for list of all product items.
router.get("/products", product_controller.product_list);

/// INSTRUMENT ROUTES ///

// GET request for creating instrument. NOTE This must come before route for id (i.e. display author).
router.get("/instrument/create", instrument_controller.instrument_create_get);

// POST request for creating instrument.
router.post("/instrument/create", upload.single('productImage'), instrument_controller.instrument_create_post);

// GET request to delete instrument.
router.get("/instrument/:name/:id/delete", instrument_controller.instrument_delete_get);

// POST request to delete instrument.
router.post("/instrument/:name/:id/delete", instrument_controller.instrument_delete_post);

// GET request to confirm delete instrument.
router.get("/instrument/:name/:id/delete/password", instrument_controller.instrument_delete_password_get);

// POST request to confirm delete instrument.
router.post("/instrument/:name/:id/delete/password", instrument_controller.instrument_delete_password_post);

// GET request to update instrument.
router.get("/instrument/:name/:id/update", instrument_controller.instrument_update_get);

// POST request to update instrument.
router.post("/instrument/:name/:id/update", instrument_controller.instrument_update_post);

// GET request for one instrument.
router.get("/instrument/:name/:id", instrument_controller.instrument_detail);

// GET request for list of all instruments.
router.get("/instruments", instrument_controller.instrument_list);

/// BRAND ROUTES ///

// GET request for creating a brand. NOTE This must come before route that displays Genre (uses id).
router.get("/brand/create", brand_controller.brand_create_get);

//POST request for creating brand.
router.post("/brand/create", upload.single('productImage'), brand_controller.brand_create_post);

// GET request to delete brand.
router.get("/brand/:name/:id/delete", brand_controller.brand_delete_get);

// POST request to delete brand.
router.post("/brand/:name/:id/delete", brand_controller.brand_delete_post);

// GET request to confirm delete brand.
router.get("/brand/:name/:id/delete/password", brand_controller.brand_delete_password_get);

// POST request to confirm delete brand.
router.post("/brand/:name/:id/delete/password", brand_controller.brand_delete_password_post);

// GET request to update brand.
router.get("/brand/:name/:id/update", brand_controller.brand_update_get);

// POST request to update brand.
router.post("/brand/:id/update", brand_controller.brand_update_post);

// GET request for one brand.
router.get("/brand/:name/:id", brand_controller.brand_detail);

// GET request for list of all brands.
router.get("/brands", brand_controller.brand_list);

module.exports = router;
