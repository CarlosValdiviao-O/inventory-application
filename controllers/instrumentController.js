const Instrument = require("../models/instrument");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");

// Display list of all Instruments.
exports.instrument_list = asyncHandler(async (req, res, next) => {
  const allInstruments = await Instrument.find().sort({ name: 1 }).exec();
  for(let i = 0; i < allInstruments.length; i++) {
    allInstruments[i].base64 = new Buffer(allInstruments[i].image).toString('base64');
  }
  res.render("instrument_list", {
    title: "Instrument List",
    instrument_list: allInstruments,
  });
});

// Display detail page for a specific Instrument.
exports.instrument_detail = asyncHandler(async (req, res, next) => {
  // Get details of instrument and all associated products (in parallel)
  const [instrument, productsInInstrument] = await Promise.all([
    Instrument.findById(req.params.id).exec(),
    Product.find({ instrument: req.params.id }, "name image image_name price mime_type").exec(),
  ]);
  instrument.base64 = new Buffer(instrument.image).toString('base64');
  for(let i = 0; i < productsInInstrument.length; i++) {
    productsInInstrument[i].base64 = new Buffer(productsInInstrument[i].image).toString('base64');
  }
  if (instrument === null) {
    // No results.
    const err = new Error("Instrument not found");
    err.status = 404;
    return next(err);
  }

  res.render("instrument_detail", {
    title: instrument.name,
    instrument: instrument,
    instrument_products: productsInInstrument,
  });
});

// Display Instrument create form on GET.
exports.instrument_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create GET");
});

// Handle Instrument create on POST.
exports.instrument_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create POST");
});

// Display Instrument delete form on GET.
exports.instrument_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
});

// Handle Instrument delete on POST.
exports.instrument_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
});

// Display Instrument update form on GET.
exports.instrument_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Instrument update on POST.
exports.instrument_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});
