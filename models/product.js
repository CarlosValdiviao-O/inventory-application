const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  brand: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
  description: { type: String, required: true, maxLength: 300 },
  instrument: { type: Schema.Types.ObjectId, ref: "Instrument", required: true },
  price: { type: Number, required: true },
  in_stock: { type: Number, required: true },
  image_name: {type: String, required: true },
  image: { type: Buffer, required: true },
});

ProductSchema.virtual("url").get(function () {
  return `/catalog/product/${this.name}/${this._id}`;
});

module.exports = mongoose.model("Product", ProductSchema);
