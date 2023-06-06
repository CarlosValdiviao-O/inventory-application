const Product = require("../models/product");
const Instrument = require('../models/instrument');
const Brand = require('../models/brand');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('mz/fs');

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
    const allProducts = await Product.find({}, "name image image_name price mime_type")
      .sort({ name: 1 })
      .exec();
    for(let i = 0; i < allProducts.length; i++) {
      allProducts[i].base64 = new Buffer(allProducts[i].image).toString('base64');
    }
    res.render("product_list", { title: "Product List", product_list: allProducts });
});

// Display detail page for a specific product.
exports.product_detail = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('brand').populate('instrument').exec();
  product.base64 = new Buffer(product.image).toString('base64');
  if (product === null) {
    // No results.
    const err = new Error("Product not found");
    err.status = 404;
    return next(err);
  }

  res.render("product_detail", {
    title: product.name,
    product: product,
  });
});

// Display product create form on GET.
exports.product_create_get = asyncHandler(async (req, res, next) => {
  // Get all instruments and brands, which we can use for adding to our book.
  const [allInstruments, allBrands] = await Promise.all([
    Instrument.find().exec(),
    Brand.find().exec(),
  ]);

  res.render("product_form", {
    title: "Create Product",
    instruments: allInstruments,
    brands: allBrands,
  });
});

// Handle product create on POST.
exports.product_create_post = [
  // Validate and sanitize fields.
  body("name", "Product name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("name", "Product name must contain less than 50 characters")
    .trim()
    .isLength({ max: 50 })
    .escape(),
  body('description', 'Description must contain at least 50 characters')
    .trim()
    .isLength({ min: 50 })
    .escape(),
  body('description', 'Description must contain less than 1000 characters')
    .trim()
    .isLength({ max: 1000 })
    .escape(),
  body('price', 'Price oustide of range')
    .trim()
    .isFloat({ min: 1, max: 10000000})
    .escape(),
  body('in_stock', 'Stock number outside of range')
    .trim()
    .isInt({ min: 1, max: 10000})
    .escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    let fileErrors = [];
    let img,
      img_name;
    if (req.file) {
      let data = await fs.readFile(`./uploads/${req.file.filename}`);

      // Convert to Base64 and print out a bit to show it's a string
      let base64 = data.toString('base64');

      // Feed out string to a buffer and then put it in the database
      img = new Buffer(base64, 'base64');
      img_name = req.body.name.toLowerCase().replace(/ /g, '-') + '.' + req.file.mimetype;
      await fs.unlink(`./uploads/${req.file.filename}`);
    }
    else {
      fileErrors.push(new Error('You must pick a file / Invalid file'));
    }
    // Create a Product object with escaped and trimmed data.
    const product = new Product({ 
      name: req.body.name,
      description: req.body.description, 
      image: img,
      image_name: img_name,
      price: req.body.price,
      in_stock: req.body.in_stock,
      instrument: req.body.instrument,
      brand: req.body.brand,
      admin: false,
    });

    if (!errors.isEmpty() || fileErrors.length > 0) {
      // Get all instruments and brands, which we can use for adding to our book.
      const [allInstruments, allBrands] = await Promise.all([
        Instrument.find().exec(),
        Brand.find().exec(),
      ]);

      // There are errors. Render the form again with sanitized values/error messages.
      res.render("product_form", {
        title: "Create Product",
        product: product,
        instruments: allInstruments,
        brands: allBrands,
        errors: errors.array().concat(fileErrors),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if product with same name already exists.
      const productExists = await Product.findOne({ name: req.body.name }).exec();
      if (productExists) {
        // product exists, redirect to its detail page.
        res.redirect(productExists.url);
      } else {
        await product.save();
        // New product saved. Redirect to product detail page.
        res.redirect(product.url);
      }
    }
  }),
];

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
