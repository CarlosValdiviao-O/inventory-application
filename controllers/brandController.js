const Brand = require("../models/brand");
const TempBrand = require("../models/temp_brand");
const Product = require('../models/product');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('mz/fs');

require('dotenv').config();

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
  if (brand === null) {
    // No results.
    const err = new Error("Brand not found");
    err.status = 404;
    return next(err);
  }
  brand.base64 = new Buffer(brand.logo).toString('base64');
  for(let i = 0; i < productsInBrand.length; i++) {
    productsInBrand[i].base64 = new Buffer(productsInBrand[i].image).toString('base64');
  }

  res.render("brand_detail", {
    title: brand.name,
    brand: brand,
    brand_products: productsInBrand,
  });
});

// Display Brand create form on GET.
exports.brand_create_get = asyncHandler(async (req, res, next) => {
  res.render("brand_form", { title: "Create Brand" });
});

// Handle Brand create on POST.
exports.brand_create_post = [
  // Validate and sanitize fields.
  body("name", "Brand name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("name", "Brand name must contain less than 50 characters")
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
    // Create a brand object with escaped and trimmed data.
    const brand = new Brand({ 
      name: req.body.name,
      description: req.body.description, 
      logo: img,
      logo_name: img_name,
      admin: false,
    });

    if (!errors.isEmpty() || fileErrors.length > 0) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("brand_form", {
        title: "Create Brand",
        brand: brand,
        errors: errors.array().concat(fileErrors),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if brand with same name already exists.
      const brandExists = await Brand.findOne({ name: req.body.name }).exec();
      if (brandExists) {
        // brand exists, redirect to its detail page.
        res.redirect(brandExists.url);
      } else {
        await brand.save();
        // New brand saved. Redirect to brand detail page.
        res.redirect(brand.url);
      }
    }
  }),
];

// Display Brand delete form on GET.
exports.brand_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of brand and all associated products (in parallel)
  const [brand, productsInBrand] = await Promise.all([
    Brand.findById(req.params.id).exec(),
    Product.find({ brand: req.params.id }, "name image image_name price mime_type").exec(),
  ]);

  if (brand === null) {
    // No results.
    res.redirect("/catalog/brands");
  }

  for(let i = 0; i < productsInBrand.length; i++) {
    productsInBrand[i].base64 = new Buffer(productsInBrand[i].image).toString('base64');
  }

  res.render("brand_delete", {
    title: "Delete Brand",
    brand: brand,
    brand_products: productsInBrand,
  });
});

// Handle Brand delete on POST.
exports.brand_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of brand and all associated products (in parallel)
  const [brand, productsInBrand] = await Promise.all([
    Brand.findById(req.params.id).exec(),
    Product.find({ brand: req.params.id }, "name image image_name price mime_type").exec(),
  ]);

  if (productsInBrand.length > 0) {
    // Brand has products. Render in same way as for GET route.
    res.render("brand_delete", {
      title: "Delete Brand",
      brand: brand,
      brand_products: productsInBrand,
    });
    return;
  } else {
    if (brand.admin == true) {
      res.redirect(brand.url+'/delete/password')
    }
    // Brand has no products. Delete object and redirect to the list of brands.
    await Brand.findByIdAndRemove(req.body.brandid);
    res.redirect("/catalog/brands");
  }
});

exports.brand_delete_password_get = asyncHandler(async (req, res, next) => {
  res.render('secret_password', {
    title: "Confirm Deletion",
  })
});

exports.brand_delete_password_post = asyncHandler(async (req, res, next) => {
  if (req.body.password === process.env.SECRET_PASSWORD) {
    await Brand.findByIdAndRemove(req.body.brandid);
    res.redirect("/catalog/brands");
  }
  else {
    res.render('secret_password', {
      title: "Confirm Deletion",
      error: true,
    })
  }
});

// Display Brand update form on GET.
exports.brand_update_get = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id).exec();

  if (brand === null) {
    // No results.
    const err = new Error("Brand not found");
    err.status = 404;
    return next(err);
  }
  brand.base64 = new Buffer(brand.logo).toString('base64');

  res.render("brand_form", {
    title: "Update Brand",
    brand: brand,
  });
});

// Handle Brand update on POST.
exports.brand_update_post = [
  // Validate and sanitize fields.
  body("name", "Brand name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("name", "Brand name must contain less than 50 characters")
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

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    let img = new Buffer(req.body.base64, 'base64'),
      img_name = req.body.img_name;
    if (req.file) {
      let data = await fs.readFile(`./uploads/${req.file.filename}`);

      // Convert to Base64 and print out a bit to show it's a string
      let base64 = data.toString('base64');

      // Feed out string to a buffer and then put it in the database
      img = new Buffer(base64, 'base64');
      img_name = req.body.name.toLowerCase().replace(/ /g, '-') + '.' + req.file.mimetype;
      await fs.unlink(`./uploads/${req.file.filename}`);
    }
    // Create a brand object with escaped and trimmed data.
    const brand = new Brand({ 
      name: req.body.name,
      description: req.body.description, 
      logo: img,
      logo_name: img_name,
      admin: req.body.admin == 'true' ? true : false,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      brand.base64 = new Buffer(brand.logo).toString('base64');
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("brand_form", {
        title: "Update Brand",
        brand: brand,
        errors: errors.array().concat(fileErrors),
      });
      return;
    } else {
        if (brand.admin === true) {
          //create temp
          const tempBrand = new TempBrand({ 
            createdAt: new Date(),
            name: req.body.name,
            description: req.body.description, 
            logo: img,
            logo_name: img_name,
            admin: true,
            original: req.params.id, 
          });
          await tempBrand.save();
          res.redirect(brand.url + '/update/password')
        }
        // Data from form is valid. Update the record.
        const thebrand = await Brand.findByIdAndUpdate(req.params.id, brand, {});
        // Redirect to brand detail page.
        res.redirect(thebrand.url);
    }
  }),
];

exports.brand_update_password_get = asyncHandler(async (req, res, next) => {
  res.render('secret_password', {
    title: "Confirm Update",
  })
});

exports.brand_update_password_post = asyncHandler(async (req, res, next) => {
  
  if (req.body.password === process.env.SECRET_PASSWORD) {
    const tempBrand = await TempBrand.findOne({original: req.params.id}).sort({createdAt: -1}).exec();
    if (tempBrand === null) {
      res.redirect('/catalog/brand/' + req.params.name + '/' + req.params.id)
    }
    const brand = new Brand({ 
      name: tempBrand.name,
      description: tempBrand.description, 
      logo: tempBrand.logo,
      logo_name: tempBrand.logo_name,
      admin: tempBrand.admin,
      _id: req.params.id, 
    });
    const thebrand = await Brand.findByIdAndUpdate(req.params.id, brand, {});
    // Redirect to brand detail page.
    res.redirect(thebrand.url);
  }
  else {
    res.render('secret_password', {
      title: "Confirm Update",
      error: true,
    })
  }
});
