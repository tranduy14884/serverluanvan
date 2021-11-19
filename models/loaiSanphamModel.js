const mongoose = require("mongoose");

const loaiSanphamSchema = new mongoose.Schema(
  {
    ma: {
      type: String,
    },
    ten: {
      type: String,
      required: true,
    },
    mota: {
      type: String,
    },
    ngaytao: String,
  },
  {
    timestamps: true,
  }
);

const LoaiSanpham = mongoose.model("LoaiSanpham", loaiSanphamSchema);

module.exports = LoaiSanpham;
