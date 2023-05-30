const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 300 },
  logo: { type: Buffer, required: true },
  logo_name: { type: String, required: true },
});

BrandSchema.virtual("url").get(function () {
  return `/catalog/brand/${this.name}/${this._id}`;
});

module.exports = mongoose.model("Brand", BrandSchema);
