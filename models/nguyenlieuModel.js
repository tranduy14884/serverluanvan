const mongoose = require("mongoose");

const nguyenlieuSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
    },
    mota: {
      type: String,
    },
    thuoctinh: [],
    hinhanh: {
      type: String,
    },
    congdung: {
      type: String,
    },
    soluong: {
      type: Number,
    },
    soluongloi: {
      type: Number,
    },
    slsaukhipp: {
      type: Number,
    },
    ngaytao: String,
    ngaybaoloi: String,
  },
  {
    timestamps: true,
  }
);

const Nguyenlieu = mongoose.model("Nguyenlieu", nguyenlieuSchema);

module.exports = Nguyenlieu;
