const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TempProductSchema = new Schema({
  createdAt: { type: Date, },
  name: { type: String, required: true, maxLength: 100 },
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  description: { type: String, required: true, maxLength: 1000 },
  instrument: { type: Schema.Types.ObjectId, ref: "Instrument", required: true },
  price: { type: Number, required: true },
  in_stock: { type: Number, required: true },
  image_name: {type: String, required: true },
  image: { type: Buffer, required: true },
  admin: { type: Boolean, required: true},
  original: { type: Schema.Types.ObjectId, ref: "Product", required: true }
});

TempProductSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 600 } )

module.exports = mongoose.model("Temp_Product", TempProductSchema);
