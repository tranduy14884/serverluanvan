const mongoose = require("mongoose");

const donhangSchema = new mongoose.Schema(
  {
    ma: String,
    dssanpham: [
      {
        sanpham: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Sanpham",
        },
        soluong: Number,
        soluonghoanthanh: {
          type: Number,
          default: 0,
        },
      },
    ],
    tongsanpham: Number,
    dscongcu: [
      {
        congcu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Congcu",
        },
        soluong: Number, // = số lượng sp đặt * định mức công cụ
      },
    ],
    tongcongcu: Number, // = tổng số lượng của tất cả các công cụ: công cụ A, công cụ B,...
    dsvattu: [
      {
        vattu: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Vattu",
        },
        soluong: Number,
      },
    ],
    tongvattu: Number,
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
    tongnguyenlieu: Number,
    from: {
      bophankd: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bophankd",
      },
      giamsatvung: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Giamsatvung",
      },
      daily1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Daily1",
      },
      daily2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Daily2",
      },
    },
    to: {
      giamsatvung: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Giamsatvung",
      },
      daily1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Daily1",
      },
      daily2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Daily2",
      },
      hodan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hodan",
      },
    },
    tongdongia: Number,
    donhanggoc: Boolean,
    dasudung: Boolean,
    ngaytao: String, // dùng cho đon hàng được tạo đầu tiên, dù là đơn hàng subdonhang
    ngaydathang: String, // Ngày bên này đặt hàng bên kia, dùng ngày này để lưu ngày nhận cc, vt, ngl
  },
  {
    timestamps: true,
  }
);

const Donhang = mongoose.model("Donhang", donhangSchema);

module.exports = Donhang;
