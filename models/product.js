const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  description: { type: String, required: true, maxLength: 1000 },
  instrument: { type: Schema.Types.ObjectId, ref: "Instrument", required: true },
  price: { type: Number, required: true },
  in_stock: { type: Number, required: true },
  image_name: {type: String, required: true },
  image: { type: Buffer, required: true },
  admin: { type: Boolean, required: true},
});

ProductSchema.virtual("url").get(function () {
  return `/catalog/product/${this._id}`;
});

ProductSchema.virtual('mime_type').get(function () {
  let divided = this.image_name.split('.');
  return divided[divided.length - 1];
});

module.exports = mongoose.model("Product", ProductSchema);
