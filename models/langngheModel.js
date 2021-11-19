const mongoose = require("mongoose");

const langngheSchema = new mongoose.Schema(
  {
    ten: String,
    tinh: String,
    huyen: String,
    loaisanpham: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LoaiSanpham",
      },
    ],
    giamsatvung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Giamsatvung",
    },
  },
  {
    timestamps: true,
  }
);

const Langnghe = mongoose.model("Langnghe", langngheSchema);

module.exports = Langnghe;
