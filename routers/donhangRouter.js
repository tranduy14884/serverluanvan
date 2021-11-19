const express = require("express");
const Bophankd = require("../models/bophankdModel");
const Daily1 = require("../models/daily1Model");
const Daily2 = require("../models/daily2Model");
const Donhang = require("../models/donhangModel");
const Giamsatvung = require("../models/giamsatvungModel");
const Hodan = require("../models/hodanModel");
const { getCurrentDatetime } = require("../utils");
const donhangRouter = express.Router();

// them don hang
donhangRouter.post("/them", async (req, res) => {
  const {
    ma,
    dssanpham,
    tongsanpham,
    dscongcu,
    tongcongcu,
    dsvattu,
    tongvattu,
    dsnguyenlieu,
    tongnguyenlieu,
    tongdongia,
  } = req.body;
  try {
    const newDH = new Donhang({
      ma,
      dssanpham,
      tongsanpham,
      dscongcu,
      tongcongcu,
      dsvattu,
      tongvattu,
      dsnguyenlieu,
      tongnguyenlieu,
      tongdongia,
      ngaytao: getCurrentDatetime(),
      donhanggoc: true,
      dasudung: false,
    });
    const savedDH = await newDH.save();

    res.send({ savedDH, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// Lấy ALL ds đơn hàng là đơn hàng gốc
donhangRouter.get("/alldanhsach", async (req, res) => {
  try {
    let donhang = await Donhang.find({})
      .populate({
        path: "dssanpham",
        populate: {
          path: "sanpham loaisanpham",
          populate: {
            path: "dscongcu dsvattu dsnguyenlieu",
            populate: {
              path: "congcu vattu nguyenlieu",
            },
          },
        },
      })
      .sort({ createdAt: "desc" });

    donhang = donhang.filter((dh) => dh.donhanggoc);

    res.send({ donhang, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// Lấy ds đơn hàng gốc chưa dược sử dụng
donhangRouter.get("/danhsach", async (req, res) => {
  try {
    let donhang = await Donhang.find({})
      .populate({
        path: "dssanpham",
        populate: {
          path: "sanpham loaisanpham",
          populate: {
            path: "dscongcu dsvattu dsnguyenlieu",
            populate: {
              path: "congcu vattu nguyenlieu",
            },
          },
        },
      })
      .sort({ createdAt: "desc" });

    donhang = donhang.filter((dh) => dh.donhanggoc && !dh.dasudung);

    res.send({ donhang, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lấy 1 đơn hàng gốc bất kì
donhangRouter.get("/single/:id", async (req, res) => {
  try {
    const donhang = await Donhang.findById(req.params.id)
      .populate({
        path: "dssanpham dscongcu dsvattu dsnguyenlieu",
        populate: {
          path: "sanpham congcu vattu nguyenlieu",
        },
      })
      .populate({
        path: "from",
        populate: {
          path: "bophankd giamsatvung daily1 daily2",
        },
      })
      .populate({
        path: "dssanpham",
        populate: {
          path: "sanpham",
          populate: {
            path: "loaisanpham dscongcu.congcu dsvattu.vattu dsnguyenlieu.nguyenlieu",
          },
        },
      });

    res.send({ donhang, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// bophankds send donhang -> gsv
donhangRouter.put("/bophankdtogsv", async (req, res) => {
  const { donhangId, dsdonhang, bophankdId } = req.body;
  try {
    // Donhang coll
    const donhang = await Donhang.findById(donhangId);
    donhang.from = { bophankd: bophankdId };
    donhang.dasudung = true;
    donhang.ngaydathang = getCurrentDatetime();
    const savedDonhang = await donhang.save();
    // Bophankd coll
    let dsspTemp = donhang.dssanpham.map((sp) => ({
      donhang: savedDonhang._id.toString(),
      sanpham: sp.sanpham,
      soluong: sp.soluong,
      soluonghoanthanh: sp.soluonghoanthanh,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsccTemp = donhang.dscongcu.map((cc) => ({
      donhang: savedDonhang._id.toString(),
      congcu: cc.congcu,
      soluong: cc.soluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsvtTemp = donhang.dsvattu.map((vt) => ({
      donhang: savedDonhang._id.toString(),
      vattu: vt.vattu,
      soluong: vt.soluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsnglTemp = donhang.dsnguyenlieu.map((ngl) => ({
      donhang: savedDonhang._id.toString(),
      nguyenlieu: ngl.nguyenlieu,
      khoiluong: ngl.khoiluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    const bophankd = await Bophankd.findById(bophankdId);
    bophankd.dssanpham = [...dsspTemp, ...bophankd.dssanpham];
    bophankd.dscongcu = [...dsccTemp, ...bophankd.dscongcu];
    bophankd.dsvattu = [...dsvtTemp, ...bophankd.dsvattu];
    bophankd.dsnguyenlieu = [...dsnglTemp, ...bophankd.dsnguyenlieu];
    await bophankd.save();

    for (const item of dsdonhang) {
      const newDH = new Donhang({
        ...item,
        ngaytao: getCurrentDatetime(),
      });
      const savedDH = await newDH.save();
      // Giamsatvung coll
      const gsv = await Giamsatvung.findById(item.to.giamsatvung);
      gsv.donhang = [savedDH._id, ...gsv.donhang];
      await gsv.save();
      // Bophankd coll
      const bpkd = await Bophankd.findById(bophankdId);
      bpkd.donhang = !bpkd.donhang.includes(donhangId)
        ? [donhangId, ...bpkd.donhang]
        : bpkd.donhang;
      bpkd.subdonhang = [savedDH._id, ...bpkd.subdonhang];
      await bpkd.save();
    }

    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// giamsatvung send donhang -> daily1
donhangRouter.put("/gsvtodaily1", async (req, res) => {
  const { donhangId, dsdonhang, gsvId } = req.body;
  try {
    // Donhang coll
    const donhang = await Donhang.findById(donhangId);
    donhang.ngaydathang = getCurrentDatetime();
    const savedDonhang = await donhang.save();
    // Giamsatvung coll
    let dsspTemp = donhang.dssanpham.map((sp) => ({
      donhang: savedDonhang._id.toString(),
      sanpham: sp.sanpham,
      soluong: sp.soluong,
      soluonghoanthanh: sp.soluonghoanthanh,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsccTemp = donhang.dscongcu.map((cc) => ({
      donhang: savedDonhang._id.toString(),
      congcu: cc.congcu,
      soluong: cc.soluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsvtTemp = donhang.dsvattu.map((vt) => ({
      donhang: savedDonhang._id.toString(),
      vattu: vt.vattu,
      soluong: vt.soluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsnglTemp = donhang.dsnguyenlieu.map((ngl) => ({
      donhang: savedDonhang._id.toString(),
      nguyenlieu: ngl.nguyenlieu,
      khoiluong: ngl.khoiluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    const gsv = await Giamsatvung.findById(gsvId);
    gsv.dssanpham = [...dsspTemp, ...gsv.dssanpham];
    gsv.dscongcu = [...dsccTemp, ...gsv.dscongcu];
    gsv.dsvattu = [...dsvtTemp, ...gsv.dsvattu];
    gsv.dsnguyenlieu = [...dsnglTemp, ...gsv.dsnguyenlieu];
    await gsv.save();

    for (const item of dsdonhang) {
      const newDH = new Donhang({
        ...item,
        ngaytao: getCurrentDatetime(),
      });
      const savedDH = await newDH.save();
      // Daily1 coll
      const dl1 = await Daily1.findById(item.to.daily1);
      dl1.donhang = [savedDH._id, ...dl1.donhang];
      await dl1.save();
      // Giamsatvung coll
      const gsv = await Giamsatvung.findById(gsvId);
      gsv.subdonhang = [savedDH._id, ...gsv.subdonhang];
      await gsv.save();
    }

    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// daily1 send donhang -> daily2
donhangRouter.put("/daily1todaily2", async (req, res) => {
  const { donhangId, dsdonhang, daily1Id } = req.body;
  try {
    // Donhang coll
    const donhang = await Donhang.findById(donhangId);
    donhang.ngaydathang = getCurrentDatetime();
    const savedDonhang = await donhang.save();
    // Daily1 coll
    let dsspTemp = donhang.dssanpham.map((sp) => ({
      donhang: savedDonhang._id.toString(),
      sanpham: sp.sanpham,
      soluong: sp.soluong,
      soluonghoanthanh: sp.soluonghoanthanh,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsccTemp = donhang.dscongcu.map((cc) => ({
      donhang: savedDonhang._id.toString(),
      congcu: cc.congcu,
      soluong: cc.soluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsvtTemp = donhang.dsvattu.map((vt) => ({
      donhang: savedDonhang._id.toString(),
      vattu: vt.vattu,
      soluong: vt.soluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    let dsnglTemp = donhang.dsnguyenlieu.map((ngl) => ({
      donhang: savedDonhang._id.toString(),
      nguyenlieu: ngl.nguyenlieu,
      khoiluong: ngl.khoiluong,
      ngaytao: savedDonhang.ngaydathang,
    }));
    const dl1 = await Daily1.findById(daily1Id);
    dl1.dssanpham = [...dsspTemp, ...dl1.dssanpham];
    dl1.dscongcu = [...dsccTemp, ...dl1.dscongcu];
    dl1.dsvattu = [...dsvtTemp, ...dl1.dsvattu];
    dl1.dsnguyenlieu = [...dsnglTemp, ...dl1.dsnguyenlieu];
    await dl1.save();

    for (const item of dsdonhang) {
      const newDH = new Donhang({
        ...item,
        ngaytao: getCurrentDatetime(),
      });
      const savedDH = await newDH.save();
      // Daily2 coll
      const dl2 = await Daily2.findById(item.to.daily2);
      dl2.donhang = [savedDH._id, ...dl2.donhang];
      await dl2.save();
      // Daily1 coll
      const dl1 = await Daily1.findById(daily1Id);
      dl1.subdonhang = [savedDH._id, ...dl1.subdonhang];
      await dl1.save();
    }

    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// daily2 send donhang -> hodan
donhangRouter.put("/daily2tohodan", async (req, res) => {
  const { donhangId, dsdonhang, daily2Id } = req.body;
  try {
    // Donhang coll
    const donhang = await Donhang.findById(donhangId);
    // Daily2 coll
    let dsspTemp = donhang.dssanpham.map((sp) => ({
      donhang: donhang._id.toString(),
      sanpham: sp.sanpham,
      soluong: sp.soluong,
      soluonghoanthanh: sp.soluonghoanthanh,
      ngaytao: donhang.ngaydathang,
    }));
    let dsccTemp = donhang.dscongcu.map((cc) => ({
      donhang: donhang._id.toString(),
      congcu: cc.congcu,
      soluong: cc.soluong,
      ngaytao: donhang.ngaydathang,
    }));
    let dsvtTemp = donhang.dsvattu.map((vt) => ({
      donhang: donhang._id.toString(),
      vattu: vt.vattu,
      soluong: vt.soluong,
      ngaytao: donhang.ngaydathang,
    }));
    let dsnglTemp = donhang.dsnguyenlieu.map((ngl) => ({
      donhang: donhang._id.toString(),
      nguyenlieu: ngl.nguyenlieu,
      khoiluong: ngl.khoiluong,
      ngaytao: donhang.ngaydathang,
    }));
    const dl2 = await Daily2.findById(daily2Id);
    dl2.dssanpham = [...dsspTemp, ...dl2.dssanpham];
    dl2.dscongcu = [...dsccTemp, ...dl2.dscongcu];
    dl2.dsvattu = [...dsvtTemp, ...dl2.dsvattu];
    dl2.dsnguyenlieu = [...dsnglTemp, ...dl2.dsnguyenlieu];
    await dl2.save();

    // Donhang coll
    donhang.ngaydathang = getCurrentDatetime();
    await donhang.save();

    for (const item of dsdonhang) {
      const newDH = new Donhang({
        ...item,
        ngaytao: getCurrentDatetime(),
      });
      const savedDH = await newDH.save();
      // Hodan coll
      const hd = await Hodan.findById(item.to.hodan);
      hd.donhang = [savedDH._id, ...hd.donhang];
      await hd.save();
      // Daily2 coll
      const dl2 = await Daily2.findById(daily2Id);
      dl2.subdonhang = [savedDH._id, ...dl2.subdonhang];
      await dl2.save();
    }

    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

module.exports = donhangRouter;
