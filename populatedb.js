#! /usr/bin/env node

console.log(
    'This script populates some test products, instruments and brands to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  const fs = require('mz/fs');
  
  const Product = require("./models/product");
  const Instrument = require("./models/instrument");
  const Brand = require("./models/brand");

  const brands = [];
  const instruments = [];
  const products = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false); // Prepare for Mongoose 7
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createBrands();
    await createInstruments();
    await createProducts();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  async function brandCreate(name, description, logo, logo_name) {
    const brand = new Brand({ 
      name: name, 
      description: description,
      logo: logo, 
      logo_name: logo_name,
    });
    await brand.save();
    brands.push(brand);
    console.log(`Added brand: ${name}`);
  }
  
  async function instrumentCreate(name, description, image, image_name) {
    const instrument = new Instrument({ 
      name: name, 
      description: description,
      image: image,
      image_name: image_name, 
    });
    await instrument.save();
    instruments.push(instrument);
    console.log(`Added instrument: ${name}`);
  }
  
  async function productCreate(name, description, price, in_stock, image, image_name, brand, instrument ) {
    const productdetail = {
      name: name,
      description: description,
      price: price,
      in_stock: in_stock,
      image: image,
      image_name: image_name,
      brand: brand,
      instrument: instrument,
    };
    const product = new Product(productdetail);
    await product.save();
    products.push(product);
    console.log(`Added product: ${name}`);
  }
  
  async function createBrands() {
    console.log("Adding brands");
    //fill array
    let images = await getFiles([]);
    await Promise.all([
      brandCreate("brand1", 'desc', images[0].image, images[0].image_name),
      brandCreate("brand2", 'desc', images[1].image, images[1].image_name),
      brandCreate("brand3", 'desc', images[2].image, images[2].image_name),
    ]);
  }
  
  async function createInstruments() {
    console.log("Adding instruments");
    //fill array
    let images = await getFiles([]);
    await Promise.all([
      instrumentCreate("instrument1", 'desc', images[0].image, images[0].image_name),
      instrumentCreate("instrument2", 'desc', images[1].image, images[1].image_name),
      instrumentCreate("instrument3", 'desc', images[2].image, images[2].image_name),
    ]);
  }
  
  async function createProducts() {
    console.log("Adding products");
    let images = await getFiles(['Absol.png', 'Bidoof.png', 'Cacnea.png']);
    await Promise.all([
      productCreate(
        "product1",
        "desc",
        12,
        3,
        images[0].image,
        images[0].image_name,
        brands[0],
        instruments[0],
      ),
      productCreate(
        "product2",
        "desc",
        12,
        3,
        images[1].image,
        images[1].image_name,
        brands[1],
        instruments[1],
      ),
      productCreate(
        "product1",
        "desc",
        12,
        3,
        images[2].image,
        images[2].image_name,
        brands[2],
        instruments[2],
      ),
    ]);
  }

async function getFiles(files) {
  let images = [];

  for ( let i = 0; i < files.length; i ++) {

  let data = await fs.readFile(`./temp/${files[i]}`);

  // Convert to Base64 and print out a bit to show it's a string
  let base64 = data.toString('base64');

  // Feed out string to a buffer and then put it in the database
  let img = new Buffer(base64, 'base64');
  images.push({ "image_name": files[i], "image": img });
  }
  return images;
}
  