const Product = require("../models/product");
const Instrument = require('../models/instrument');
const Brand = require('../models/brand');
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    // Get details of products, instruments and brands counts (in parallel)
    const [
      numProducts,
      numInstruments,
      numBrands,
    ] = await Promise.all([
      Product.countDocuments({}).exec(),
      Instrument.countDocuments({}).exec(),
      Brand.countDocuments({}).exec(),
    ]);
  
    res.render("index", {
      title: "Instrument Shop",
      product_count: numProducts,
      instrument_count: numInstruments,
      brand_count: numBrands,
    });
  });

// Display list of all products.
exports.product_list = asyncHandler(async (req, res, next) => {
    const allProducts = await Product.find({}, "name image")
      .sort({ name: 1 })
      .exec();
    for(let i = 0; i < allProducts.length; i++) {
      allProducts[i].base64 = new Buffer(allProducts[i].image).toString('base64');
    }
    res.render("product_list", { title: "Product List", product_list: allProducts });
});

// Display detail page for a specific product.
exports.product_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Book detail: ${req.params.id}`);
});

// Display product create form on GET.
exports.product_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create GET");
});

// Handle product create on POST.
exports.product_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create POST");
});

// Display product delete form on GET.
exports.product_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle product delete on POST.
exports.product_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
});

// Display product update form on GET.
exports.product_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle product update on POST.
exports.product_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});
