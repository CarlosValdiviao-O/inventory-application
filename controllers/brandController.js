const Brand = require("../models/brand");
const asyncHandler = require("express-async-handler");

// Display list of all Brand.
exports.brand_list = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre list");
});

// Display detail page for a specific Brand.
exports.brand_detail = asyncHandler(async (req, res, next) => {
  res.send(`NOT IMPLEMENTED: Genre detail: ${req.params.id}`);
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