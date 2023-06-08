const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TempBrandSchema = new Schema({
  createdAt: { type: Date, },
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 1000 },
  logo: { type: Buffer, required: true },
  logo_name: { type: String, required: true },
  admin: { type: Boolean, required: true},
  original: { type: Schema.Types.ObjectId, ref: "Brand", required: true }
});

TempBrandSchema.index( { "createdAt": 1 }, { expireAfterSeconds: 600 } )

module.exports = mongoose.model("Temp_Brand", TempBrandSchema);
