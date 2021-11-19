const mongoose = require("mongoose");

const vattuSchema = new mongoose.Schema(
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

const Vattu = mongoose.model("Vattu", vattuSchema);

module.exports = Vattu;
