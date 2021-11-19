const mongoose = require("mongoose");

const lichsuSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    thaotac: String,
  },
  {
    timestamps: true,
  }
);

const Lichsu = mongoose.model("Lichsu", lichsuSchema);

module.exports = Lichsu;
