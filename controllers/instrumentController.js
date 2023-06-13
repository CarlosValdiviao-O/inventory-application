const Instrument = require("../models/instrument");
const TempInstrument = require("../models/temp_instrument");
const Product = require("../models/product");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require('mz/fs');
const validator = require('validator');

// Display list of all Instruments.
exports.instrument_list = asyncHandler(async (req, res, next) => {
  const allInstruments = await Instrument.find().sort({ name: 1 }).exec();
  for(let i = 0; i < allInstruments.length; i++) {
    allInstruments[i].base64 = new Buffer(allInstruments[i].image).toString('base64');
    allInstruments[i].name = validator.unescape(allInstruments[i].name);
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
  if (instrument === null) {
    // No results.
    const err = new Error("Instrument not found");
    err.status = 404;
    return next(err);
  }
  instrument.name = validator.unescape(instrument.name);
  instrument.description = validator.unescape(instrument.description);
  instrument.base64 = new Buffer(instrument.image).toString('base64');
  for(let i = 0; i < productsInInstrument.length; i++) {
    productsInInstrument[i].base64 = new Buffer(productsInInstrument[i].image).toString('base64');
    productsInInstrument[i].name = validator.unescape(productsInInstrument[i].name);
  }

  res.render("instrument_detail", {
    title: instrument.name,
    instrument: instrument,
    instrument_products: productsInInstrument,
  });
});

// Display Instrument create form on GET.
exports.instrument_create_get = asyncHandler(async (req, res, next) => {
  res.render("instrument_form", { title: "Create Instrument" });
});

// Handle instrument create on POST.
exports.instrument_create_post = [
  // Validate and sanitize fields.
  body("name", "Instrument name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("name", "Instrument name must contain less than 50 characters")
    .isLength({ max: 50 }),
  body('description', 'Description must contain at least 50 characters')
    .trim()
    .isLength({ min: 50 })
    .escape(),
  body('description', 'Description must contain less than 1000 characters')
    .isLength({ max: 1000 }),

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
    // Create a instrument object with escaped and trimmed data.
    const instrument = new Instrument({ 
      name: req.body.name,
      description: req.body.description, 
      image: img,
      image_name: img_name,
      admin: false,
    });

    if (!errors.isEmpty() || fileErrors.length > 0) {
      // There are errors. Render the form again with sanitized values/error messages.
      
      instrument.name = validator.unescape(instrument.name);
      instrument.description = validator.unescape(instrument.description);
      res.render("instrument_form", {
        title: "Create Instrument",
        instrument: instrument,
        errors: errors.array().concat(fileErrors),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if instrument with same name already exists.
      const instrumentExists = await Instrument.findOne({ name: req.body.name }).exec();
      if (instrumentExists) {
        // instrument exists, redirect to its detail page.
        res.redirect(instrumentExists.url);
      } else {
        await instrument.save();
        // New instrument saved. Redirect to instrument detail page.
        res.redirect(instrument.url);
      }
    }
  }),
];

// Display Instrument delete form on GET.
exports.instrument_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of instrument and all associated products (in parallel)
  const [instrument, productsInInstrument] = await Promise.all([
    Instrument.findById(req.params.id).exec(),
    Product.find({ instrument: req.params.id }, "name image image_name price mime_type").exec(),
  ]);

  if (instrument === null) {
    // No results.
    res.redirect("/catalog/instruments");
  }

  instrument.name = validator.unescape(instrument.name);
  for(let i = 0; i < productsInInstrument.length; i++) {
    productsInInstrument[i].base64 = new Buffer(productsInInstrument[i].image).toString('base64');
    productsInInstrument[i].name = validator.unescape(productsInInstrument[i].name);
  }

  res.render("instrument_delete", {
    title: "Delete Instrument",
    instrument: instrument,
    instrument_products: productsInInstrument,
  });
});

// Handle Instrument delete on POST.
exports.instrument_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of instrument and all associated products (in parallel)
  const [instrument, productsInInstrument] = await Promise.all([
    Instrument.findById(req.params.id).exec(),
    Product.find({ instrument: req.params.id }, "name image image_name price mime_type").exec(),
  ]);

  if (productsInInstrument.length > 0) {
    // Instrument has products. Render in same way as for GET route.
    instrument.name = validator.unescape(instrument.name);
    for(let i = 0; i < productsInInstrument.length; i++) {
      productsInInstrument[i].base64 = new Buffer(productsInInstrument[i].image).toString('base64');
      productsInInstrument[i].name = validator.unescape(productsInInstrument[i].name);
    }
    res.render("instrument_delete", {
      title: "Delete Instrument",
      instrument: instrument,
      instrument_products: productsInInstrument,
    });
    return;
  } else {
    if (instrument.admin == true) {
      res.redirect(instrument.url+'/delete/password')
    }
    // Instrument has no products. Delete object and redirect to the list of instruments.
    await Instrument.findByIdAndRemove(req.body.instrumentid);
    res.redirect("/catalog/instruments");
  }
});

exports.instrument_delete_password_get = asyncHandler(async (req, res, next) => {
  res.render('secret_password', {
    title: "Confirm Deletion",
  })
});

exports.instrument_delete_password_post = asyncHandler(async (req, res, next) => {
  if (req.body.password === process.env.SECRET_PASSWORD) {
    await Instrument.findByIdAndRemove(req.body.instrumentid);
    res.redirect("/catalog/instruments");
  }
  else {
    res.render('secret_password', {
      title: "Confirm Deletion",
      error: true,
    })
  }
});

// Display Instrument update form on GET.
exports.instrument_update_get = asyncHandler(async (req, res, next) => {
  const instrument = await Instrument.findById(req.params.id).exec();

  if (instrument === null) {
    // No results.
    const err = new Error("Instrument not found");
    err.status = 404;
    return next(err);
  }
  instrument.base64 = new Buffer(instrument.image).toString('base64');
  instrument.name = validator.unescape(instrument.name);
  instrument.description = validator.unescape(instrument.description);
  res.render("instrument_form", {
    title: "Update Instrument",
    instrument: instrument,
  });
});

// Handle Instrument update on POST.
exports.instrument_update_post = [
  // Validate and sanitize fields.
  body("name", "Instrument name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),
  body("name", "Instrument name must contain less than 50 characters")
    .isLength({ max: 50 }),
  body('description', 'Description must contain at least 50 characters')
    .trim()
    .isLength({ min: 50 })
    .escape(),
  body('description', 'Description must contain less than 1000 characters')
    .isLength({ max: 1000 }),

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
    // Create a instrument object with escaped and trimmed data.
    const instrument = new Instrument({ 
      name: req.body.name,
      description: req.body.description, 
      image: img,
      image_name: img_name,
      admin: req.body.admin == 'true' ? true : false,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      instrument.base64 = new Buffer(instrument.image).toString('base64');
      instrument.name = validator.unescape(instrument.name);
      instrument.description = validator.unescape(instrument.description);
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("instrument_form", {
        title: "Update Instrument",
        instrument: instrument,
        errors: errors.array(),
      });
      return;
    } else {
        if (instrument.admin === true) {
          //create temp
          const tempInstrument = new TempInstrument({ 
            createdAt: new Date(),
            name: req.body.name,
            description: req.body.description, 
            image: img,
            image_name: img_name,
            admin: true,
            original: req.params.id, 
          });
          await tempInstrument.save();
          res.redirect(instrument.url + '/update/password')
        }
        // Data from form is valid. Update the record.
        const theinstrument = await Instrument.findByIdAndUpdate(req.params.id, instrument, {});
        // Redirect to instrument detail page.
        res.redirect(theinstrument.url);
    }
  }),
];

exports.instrument_update_password_get = asyncHandler(async (req, res, next) => {
  res.render('secret_password', {
    title: "Confirm Update",
  })
});

exports.instrument_update_password_post = asyncHandler(async (req, res, next) => {
  
  if (req.body.password === process.env.SECRET_PASSWORD) {
    const tempInstrument = await TempInstrument.findOne({original: req.params.id}).sort({createdAt: -1}).exec();
    if (tempInstrument === null) {
      res.redirect('/catalog/instrument/' + req.params.id)
    }
    const instrument = new Instrument({ 
      name: tempInstrument.name,
      description: tempInstrument.description, 
      image: tempInstrument.image,
      image_name: tempInstrument.image_name,
      admin: tempInstrument.admin,
      _id: req.params.id, 
    });
    const theinstrument = await Instrument.findByIdAndUpdate(req.params.id, instrument, {});
    // Redirect to instrument detail page.
    res.redirect(theinstrument.url);
  }
  else {
    res.render('secret_password', {
      title: "Confirm Update",
      error: true,
    })
  }
});