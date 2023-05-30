const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InstrumentSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 300 },
  image: { type: Buffer, required: true },
  image_name: { type: String, required: true },
});

InstrumentSchema.virtual("url").get(function () {
  return `/catalog/instrument/${this.name}/${this._id}`;
});

module.exports = mongoose.model("Instrument", InstrumentSchema);
