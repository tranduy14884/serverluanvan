const express = require("express");
const congcuRouter = express.Router();
const upload = require("../middleware/imageUpload");
const Bophankd = require("../models/bophankdModel");
const Congcu = require("../models/congcuModel");
const { getCurrentDatetime } = require("../utils");

// them cong cu
congcuRouter.post("/them", upload.single("hinhanh"), async (req, res) => {
  const { ten, mota, thuoctinh, congdung } = req.body;
  try {
    const newCongcu = new Congcu({
      ten,
      mota,
      thuoctinh: JSON.parse(thuoctinh),
      hinhanh: req.file ? req.file.filename : "",
      congdung,
      ngaytao: getCurrentDatetime(),
    });
    const savedCongcu = await newCongcu.save();

    res.send({ savedCongcu, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// sua cong cu
congcuRouter.put("/single", upload.single("hinhanh"), async (req, res) => {
  const { ten, mota, thuoctinh, congdung, congcuId } = req.body;
  try {
    const congcu = await Congcu.findById(congcuId);
    congcu.ten = ten;
    congcu.mota = mota;
    congcu.thuoctinh = JSON.parse(thuoctinh);
    congcu.hinhanh = req.file ? req.file.filename : congcu.hinhanh;
    congcu.congdung = congdung;

    const updatedCongcu = await congcu.save();
    res.send({ updatedCongcu, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach cong cu
congcuRouter.get("/danhsach", async (req, res) => {
  const congcu = await Congcu.find({}).sort({ createdAt: "desc" });
  if (!congcu.length) {
    return res.send({ message: "Không tìm thấy công cụ", success: false });
  }
  res.send({ congcu, success: true });
});

// lay thong tin 1 cong cu
congcuRouter.get("/single/:id", async (req, res) => {
  try {
    const congcu = await Congcu.findById(req.params.id);
    if (congcu) {
      res.send({ congcu, success: true });
    } else {
      res.send({ message: "Không tìm thấy công cụ", success: false });
    }
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// them cong cu hu loi
congcuRouter.put("/themcchuloi", async (req, res) => {
  const { dsccLoi } = req.body;
  try {
    for (const item of dsccLoi) {
      const congcu = await Congcu.findById(item.congcu);
      congcu.soluongloi = item.soluongloi;
      congcu.ngaybaoloi = getCurrentDatetime();
      await congcu.save();
    }

    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// Xoa nhieu cong cu
congcuRouter.put("/xoanhieucongcu", async (req, res) => {
  const { arrOfIds } = req.body;
  try {
    for (const item of arrOfIds) {
      await Congcu.findByIdAndDelete(item);
    }

    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

module.exports = congcuRouter;
