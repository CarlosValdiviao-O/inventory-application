const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InstrumentSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 1000 },
  image: { type: Buffer, required: true },
  image_name: { type: String, required: true },
  admin: { type: Boolean, required: true},
});

InstrumentSchema.virtual("url").get(function () {
  return `/catalog/instrument/${this.name}/${this._id}`;
});

module.exports = mongoose.model("Instrument", InstrumentSchema);
