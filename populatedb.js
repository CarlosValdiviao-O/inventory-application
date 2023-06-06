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
      admin: true,
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
      admin: true,
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
      admin: true,
    };
    const product = new Product(productdetail);
    await product.save();
    products.push(product);
    console.log(`Added product: ${name}`);
  }
  
  async function createBrands() {
    console.log("Adding brands");
    let images = await getFiles(['esp-logo.png', 'fender-logo.png', 'yamaha-logo.png']);
    await Promise.all([
      brandCreate("ESP", 'ESP Company, Limited (株式会社イーエスピー, Kabushiki Gaisha Ī Esu Pī) is a Japanese guitar manufacturer, primarily focused on the production of electric guitars and basses. They are based in both Tokyo and Los Angeles, with distinct product lines for each market.', images[0].image, images[0].image_name),
      brandCreate("Fender", 'The Fender Musical Instruments Corporation (FMIC, or simply Fender) is an American manufacturer of instruments and amplifiers. Fender produces acoustic guitars, bass amplifiers and public address equipment; however, it is best known for its solid-body electric guitars and bass guitars, particularly the Stratocaster, Telecaster, Jaguar, Jazzmaster, Precision Bass, and the Jazz Bass. The company was founded in Fullerton, California by Clarence Leonidas "Leo" Fender in 1946. Its headquarters are in Los Angeles, California.', images[1].image, images[1].image_name),
      brandCreate("Yamaha", 'Yamaha Corporation (ヤマハ株式会社, Yamaha kabushiki gaisha) is a Japanese multinational corporation and conglomerate with a very wide range of products and services. It is one of the constituents of Nikkei 225 and is the world\'s largest musical instrument manufacturing company. The former motorcycle division was established in 1955 as Yamaha Motor Co., Ltd., which started as an affiliated company but later became independent, although Yamaha Corporation is still a major shareholder.', images[2].image, images[2].image_name),
    ]);
  }
  
  async function createInstruments() {
    console.log("Adding instruments");
    let images = await getFiles(['electric-guitar.jpg', 'electric-bass.jpg', 'piano-keyboard.jpg']);
    await Promise.all([
      instrumentCreate("Electric Guitar", 'An electric guitar is a guitar that requires external amplification in order to be heard at typical performance volumes, unlike a standard acoustic guitar. It uses one or more pickups to convert the vibration of its strings into electrical signals, which ultimately are reproduced as sound by loudspeakers. The sound is sometimes shaped or electronically altered to achieve different timbres or tonal qualities from that of an acoustic guitar via amplifier settings or knobs on the guitar.', images[0].image, images[0].image_name),
      instrumentCreate("Electric Bass", 'The bass guitar, electric bass or simply bass, is the lowest-pitched member of the guitar family. It is a plucked string instrument similar in appearance and construction to an electric or acoustic guitar, but with a longer neck and scale length, and typically four to six strings or courses. Since the mid-1950s, the bass guitar has largely replaced the double bass in popular music.', images[1].image, images[1].image_name),
      instrumentCreate("Piano Keyboard", 'A musical keyboard is the set of adjacent depressible levers or keys on a musical instrument. Keyboards typically contain keys for playing the twelve notes of the Western musical scale, with a combination of larger, longer keys and smaller, shorter keys that repeats at the interval of an octave. Pressing a key on the keyboard makes the instrument produce sounds—either by mechanically striking a string or tine (acoustic and electric piano, clavichord), plucking a string (harpsichord), causing air to flow through a pipe organ, striking a bell (carillon), or, on electric and electronic keyboards, completing a circuit (Hammond organ, digital piano, synthesizer). Since the most commonly encountered keyboard instrument is the piano, the keyboard layout is often referred to as the piano keyboard.', images[2].image, images[2].image_name),
    ]);
  }
  
  async function createProducts() {
    console.log("Adding products");
    let images = await getFiles([
      'esp-6-string-ltd-kh-3-kirk-hammett-signature-series.jpg',
      'esp-ltd-snakebyte-signature-series-james-hetfield.jpg',
      'esp-ltd-b-204sm-spalted-maple-bass-guitar.jpg',
      'squier-bullet-bronco-bass.jpg',
      'fender-eric-clapton-stratocaster-electric-guitar.jpg',
      'yamaha-np12-61-key-lightweight-portable-keyboard.jpg',
      'yamaha-bb435-bb-series-5-string-bass-guitar.jpg',
      'yamaha-p71-88-key-weighted-action-digital-piano.jpg',
    ]);
    await Promise.all([
      productCreate(
        "ESP 6 String LTD KH-3 Kirk Hammett Signature Series",
        "In 1991, Kirk Hammett of Metallica came to ESP with a request for a new guitar with a single cutaway design, but with the features of his KH-2 guitar. Metallica’s graphic artist Pushead designed a spider graphic specifically for this new instrument. The KH-3 Spider was played by Kirk throughout the ’90s on tours supporting the legendary Black Album. After spending a number of years on display at the Rock and Roll Hall of fame, the original KH-3 was returned to ESP so we could reference it for this 30th Anniversary edition.",
        1399,
        1,
        images[0].image,
        images[0].image_name,
        brands[0],
        instruments[0],
      ),
      productCreate(
        "ESP LTD Snakebyte Signature Series James Hetfield",
        "When James Hetfield and ESP came together to create a signature model, they changed the face of metal forever. With an ESP LTD Snake byte you get to experience the look, sound, and feel of Hatfield's own amazing guitar for yourself. The first thing you'll notice is how balanced the LTD Snake byte's body feels, making it easy to go from low-end riff age to high-flying solos.",
        1726,
        1,
        images[1].image,
        images[1].image_name,
        brands[0],
        instruments[0],
      ),
      productCreate(
        "ESP LTD B-204SM Spalted Maple Bass Guitar",
        "The ESP LTD B204SM Electric Bass Guitar yields incredibly looks and a punchy, dynamic tone thanks to a beautiful Spalted Maple top on an Ash body! This wood combination provides great clarity and resonance. The ESP LTD B204SM also features a 5 piece Maple/Rosewood neck and a 24XJ-fret Rosewood fingerboard.",
        599,
        4,
        images[2].image,
        images[2].image_name,
        brands[0],
        instruments[1],
      ),
      productCreate(
        "Squier Bullet Bronco Bass",
        "The Squier Bronco Bass is great for guitarists who occasionally need a bass, younger beginners, smaller players, or for anyone who likes the feel of a short-scale (30\") bass. It tunes easily and sounds full and rich, thanks to its single-coil pickup, maple neck, die-cast tuners and solid agathis body.",
        216,
        23,
        images[3].image,
        images[3].image_name,
        brands[1],
        instruments[1],
      ),
      productCreate(
        "Fender Eric Clapton Stratocaster Electric Guitar",
        "Slow hand fans will love the tonally versatile signature Eric Clapton Stratocaster guitar. Features include an alder body, three Vintage Noiseless pickups, active mid-boost (25 db.) and TBX circuits, special soft V-shaped neck, and blocked original vintage synchronized tremolo.",
        2099,
        3,
        images[4].image,
        images[4].image_name,
        brands[1],
        instruments[0],
      ),
      productCreate(
        "Yamaha NP12 61-Key Lightweight Portable Keyboard",
        "The Piaggero NP12 features 61 full-sized touch sensitive, piano-style keys and classic Yamaha piano tone with an ultra-portable and light-weight design. Built-in speakers and a battery power option make the NP12 your musical companion wherever you want to go. Power Supply : AC Adaptor (PA-130) or 6 x \"AA\" size batteries (alkaline [LR6], manganese [R6] or Ni-MH rechargeable batteries).",
        239,
        38,
        images[5].image,
        images[5].image_name,
        brands[2],
        instruments[2],
      ),
      productCreate(
        "Yamaha BB435 BB-Series 5-String Bass Guitar",
        "You've got the chops and you're ready to nail that audition, hit the stage, or get creative in the studio-now it's time to get out there and get noticed. The 400 lineup continues the BB tradition of great build quality and signature sound that won the series acclaim throughout its forty-year history. Whether you prefer a rosewood fingerboard or the distinctively bright, crisp sound of maple, the precision feel and response of the six bolt miter neck along with the presence and clarity of custom-wound pickups will inspire you to play your best when it really counts.",
        579,
        16,
        images[6].image,
        images[6].image_name,
        brands[2],
        instruments[1],
      ),
      productCreate(
        "YAMAHA P71 88-Key Weighted Action Digital Piano",
        "The Yamaha P71B is an Amazon-exclusive model designed to be the perfect Home digital piano for rehearsing, learning and creating. A full sized piano keyboard with fully-weighted keys and Yamaha Premium piano voices provide the user with the most realistic feel and sound possible while maintaining a modest footprint in your home.",
        499,
        23,
        images[7].image,
        images[7].image_name,
        brands[2],
        instruments[2],
      ),
    ]);
  }

async function getFiles(files) {
  let images = [];

  for ( let i = 0; i < files.length; i ++) {

    let data = await fs.readFile(`./db_images/${files[i]}`);

    // Convert to Base64 and print out a bit to show it's a string
    let base64 = data.toString('base64');

    // Feed out string to a buffer and then put it in the database
    let img = new Buffer(base64, 'base64');
    images.push({ "image_name": files[i], "image": img });
  }
  return images;
}
  