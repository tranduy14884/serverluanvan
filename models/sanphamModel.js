const mongoose = require("mongoose");

const sanphamSchema = new mongoose.Schema(
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
    hinhanh: {
      type: String,
    },
    loaisanpham: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoaiSanpham",
    },
    thuoctinh: [],
    dscongcu: [
      {
        congcu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Congcu",
        },
        soluong: Number,
      },
    ],
    dsvattu: [
      {
        vattu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vattu",
        },
        soluong: Number,
      },
    ],
    dsnguyenlieu: [
      {
        nguyenlieu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Nguyenlieu",
        },
        khoiluong: Number,
        donvitinh: String,
      },
    ],
    gia: Number,
    ngaytao: String,
  },
  {
    timestamps: true,
  }
);

const Sanpham = mongoose.model("Sanpham", sanphamSchema);

module.exports = Sanpham;
