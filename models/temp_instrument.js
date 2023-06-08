const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TempInstrumentSchema = new Schema({
  createdAt: { type: Date, },
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 1000 },
  image: { type: Buffer, required: true },
  image_name: { type: String, required: true },
  admin: { type: Boolean, required: true},
  original: { type: Schema.Types.ObjectId, ref: "Instrument", required: true }
});

TempInstrumentSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 600 } )

module.exports = mongoose.model("Temp_Instrument", TempInstrumentSchema);
