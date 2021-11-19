const mongoose = require("mongoose");

const congcuSchema = new mongoose.Schema(
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

const Congcu = mongoose.model("Congcu", congcuSchema);

module.exports = Congcu;
