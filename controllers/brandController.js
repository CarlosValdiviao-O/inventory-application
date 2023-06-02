const Brand = require("../models/brand");
const Product = require('../models/product');
const asyncHandler = require("express-async-handler");

// Display list of all Brand.
exports.brand_list = asyncHandler(async (req, res, next) => {
  const allBrands = await Brand.find().sort({ name: 1 }).exec();
  for(let i = 0; i < allBrands.length; i++) {
    allBrands[i].base64 = new Buffer(allBrands[i].logo).toString('base64');
  }
  res.render("brand_list", {
    title: "Brand List",
    brand_list: allBrands,
  });
});

// Display detail page for a specific Brand.
exports.brand_detail = asyncHandler(async (req, res, next) => {
  // Get details of brand and all associated products (in parallel)
  const [brand, productsInBrand] = await Promise.all([
    Brand.findById(req.params.id).exec(),
    Product.find({ brand: req.params.id }, "name image image_name price mime_type").exec(),
  ]);
  brand.base64 = new Buffer(brand.logo).toString('base64');
  for(let i = 0; i < productsInBrand.length; i++) {
    productsInBrand[i].base64 = new Buffer(productsInBrand[i].image).toString('base64');
  }
  if (brand === null) {
    // No results.
    const err = new Error("Brand not found");
    err.status = 404;
    return next(err);
  }

  res.render("brand_detail", {
    title: brand.name,
    brand: brand,
    brand_products: productsInBrand,
  });
});

// Display Brand create form on GET.
exports.brand_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre create GET");
});

// Handle Brand create on POST.
exports.brand_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre create POST");
});

// Display Brand delete form on GET.
exports.brand_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
});

// Handle Brand delete on POST.
exports.brand_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
});

// Display Brand update form on GET.
exports.brand_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Brand update on POST.
exports.brand_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
