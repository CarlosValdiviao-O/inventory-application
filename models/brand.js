const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BrandSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 1000 },
  logo: { type: Buffer, required: true },
  logo_name: { type: String, required: true },
  admin: { type: Boolean, required: true},
});

BrandSchema.virtual("url").get(function () {
  return `/catalog/brand/${this.name}/${this._id}`;
});

module.exports = mongoose.model("Brand", BrandSchema);
