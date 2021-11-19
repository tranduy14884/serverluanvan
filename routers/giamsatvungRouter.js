const express = require("express");
const giamsatvungRouter = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Giamsatvung = require("../models/giamsatvungModel");
const Daily2 = require("../models/daily2Model");
const Langnghe = require("../models/langngheModel");

// them gsv
giamsatvungRouter.post("/them", async (req, res) => {
  const { ten, sdt, email, cmnd, xa, huyen, tinh, taikhoan } = req.body;
  try {
    const newUser = new User({
      taikhoan,
      matkhau: bcrypt.hashSync("123456", 8),
      vaitro: "giamsatvung",
    });
    const savedUser = await newUser.save();
    const newGsv = new Giamsatvung({
      ten,
      sdt,
      email,
      cmnd,
      xa,
      huyen,
      tinh,
      user: savedUser._id,
    });
    const savedGsv = await newGsv.save();
    res.send({ savedGsv, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// cap nhat gsv
giamsatvungRouter.put("/single/:id", async (req, res) => {
  const { ten, sdt, email, cmnd, xa, huyen, tinh, matkhau } = req.body;
  try {
    const gsv = await Giamsatvung.findById(req.params.id);
    if (!gsv) {
      return res.send({
        message: "Không tìm thấy giám sát vùng nào",
        success: false,
      });
    }
    if (matkhau) {
      const user = await User.findById(gsv.user);
      user.matkhau = bcrypt.hashSync(matkhau, 8);
      await user.save();
    }
    gsv.ten = ten;
    gsv.sdt = sdt;
    gsv.email = email;
    gsv.cmnd = cmnd;
    gsv.xa = xa;
    gsv.huyen = huyen;
    gsv.tinh = tinh;
    const updatedGsv = await gsv.save();
    res.send({ updatedGsv, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach gsv
giamsatvungRouter.get("/danhsach", async (req, res) => {
  try {
    const gsv = await Giamsatvung.find({}).populate("user");
    if (!gsv.length) {
      return res.send({
        message: "Không tìm thấy giám sát vùng nào",
        success: false,
      });
    }
    res.send({ gsv, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay thong tin 1 gsv
giamsatvungRouter.get("/single/:id", async (req, res) => {
  try {
    const gsv = await Giamsatvung.findById(req.params.id).populate("user");
    if (!gsv) {
      return res.send({
        message: "Không tìm thấy giám sát vùng nào",
        success: false,
      });
    }
    res.send({ gsv, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay thong tin 1 gsv based UserId
giamsatvungRouter.get("/baseduserid/:userId", async (req, res) => {
  try {
    const gsv = await Giamsatvung.findOne({ user: req.params.userId });
    res.send({ gsv, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// xoa nhieu gsv
giamsatvungRouter.put("/multiple", async (req, res) => {
  const { arrayOfId } = req.body;
  try {
    for (const item of arrayOfId) {
      // xoa user
      const gsv = await Giamsatvung.findById(item);
      await User.findByIdAndDelete(gsv.user);
      // xoa bophankd
      await Giamsatvung.findByIdAndDelete(item);
    }
    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay ds giam sat vung chưa có bộ phận kinh doanh
giamsatvungRouter.get("/dsgsvbpkdnull", async (req, res) => {
  try {
    const gsv = await Giamsatvung.find({}).populate("user");
    if (!gsv.length) {
      return res.send({
        message: "Không tìm thấy giám sát vùng nào",
        success: false,
      });
    }
    const giamsatvung = gsv.filter((item) => !item.bophankd);
    res.send({ giamsatvung, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay ds dai ly 2 thuoc giam sat vung
giamsatvungRouter.get("/dsdaily2/:gsvId", async (req, res) => {
  try {
    const { daily2 } = await Giamsatvung.findById(req.params.gsvId)
      .select("daily2")
      .populate("daily2");
    if (!daily2.length) {
      return res.send({
        message: "Không tìm thấy đại lý 2 nào",
        success: false,
      });
    }

    res.send({ daily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// Duyệt đại lý 2
giamsatvungRouter.put("/duyet/:daily2Id/:gsvId", async (req, res) => {
  try {
    const daily2 = await Daily2.findById(req.params.daily2Id);
    // Nếu bophankd đã duyệt
    if (daily2.bophankd) {
      //tạo tài khoản trong User collection
      const newUser = new User({
        taikhoan: daily2.taikhoan,
        matkhau: bcrypt.hashSync("123456", 8),
        vaitro: "daily2",
      });
      const savedUser = await newUser.save();
      // Cập nhật đại lý 2 collection
      daily2.user = savedUser ? savedUser._id : null;
      daily2.active = true;
      daily2.giamsatvung = req.params.gsvId;
      await daily2.save();
    } else {
      daily2.giamsatvung = req.params.gsvId;
      await daily2.save();
    }

    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay ds don hang thuoc gsv
giamsatvungRouter.get("/dsdonhang/:gsvId", async (req, res) => {
  try {
    let { donhang } = await Giamsatvung.findById(req.params.gsvId)
      .select("donhang")
      .populate("donhang");

    res.send({ donhang, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay ds dai ly 1 thuoc giam sat vung
giamsatvungRouter.get("/dsdaily1/:gsvId", async (req, res) => {
  try {
    let { daily1 } = await Giamsatvung.findById(req.params.gsvId)
      .select("daily1")
      .populate("daily1");
    if (!daily1.length) {
      return res.send({
        message: "Không tìm thấy đại lý 1 nào",
        success: false,
      });
    }
    daily1 = daily1.filter((dl1) => dl1.active);

    res.send({ daily1, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach SUB don hang thuoc giamsatvung
giamsatvungRouter.get("/dssubdonhang/:gsvId/:ma", async (req, res) => {
  try {
    let { subdonhang } = await Giamsatvung.findById(req.params.gsvId)
      .select("subdonhang")
      .populate({
        path: "subdonhang",
        populate: {
          path: "from to dssanpham dscongcu dsvattu dsnguyenlieu",
          populate: {
            path: "giamsatvung daily1 sanpham congcu vattu nguyenlieu",
          },
        },
      })
      .populate({
        path: "subdonhang",
        populate: {
          path: "dssanpham",
          populate: {
            path: "sanpham",
            populate: {
              path: "loaisanpham",
            },
          },
        },
      });
    subdonhang = subdonhang.filter((item) => item.ma === req.params.ma);

    res.send({ subdonhang, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach sanpham thuoc Giamsatvung
giamsatvungRouter.get("/dssanpham/:gsvId", async (req, res) => {
  try {
    const { dssanpham } = await Giamsatvung.findById(req.params.gsvId)
      .select("dssanpham")
      .populate({
        path: "dssanpham",
        populate: {
          path: "donhang sanpham",
        },
      })
      .populate({
        path: "dssanpham",
        populate: {
          path: "sanpham",
          populate: {
            path: "loaisanpham",
          },
        },
      });

    res.send({ dssanpham, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach vattu thuoc Giamsatvung
giamsatvungRouter.get("/dsvattu/:gsvId", async (req, res) => {
  try {
    let { dsvattu } = await Giamsatvung.findById(req.params.gsvId)
      .select("dsvattu")
      .populate({
        path: "dsvattu",
        populate: "donhang vattu",
      });

    res.send({ dsvattu, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach nguyenlieu thuoc Giamsatvung
giamsatvungRouter.get("/dsnguyenlieu/:gsvId", async (req, res) => {
  try {
    const { dsnguyenlieu } = await Giamsatvung.findById(req.params.gsvId)
      .select("dsnguyenlieu")
      .populate({
        path: "dsnguyenlieu",
        populate: {
          path: "donhang nguyenlieu",
        },
      });
    res.send({ dsnguyenlieu, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach congcu thuoc Giamsatvung
giamsatvungRouter.get("/dscongcu/:gsvId", async (req, res) => {
  try {
    let { dscongcu } = await Giamsatvung.findById(req.params.gsvId)
      .select("dscongcu")
      .populate({
        path: "dscongcu",
        populate: {
          path: "donhang congcu",
        },
      });

    res.send({ dscongcu, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay so lieu tong quan
giamsatvungRouter.get("/tongquan/:gsvId", async (req, res) => {
  try {
    const gsv = await Giamsatvung.findById(req.params.gsvId);
    const langnghe = await Langnghe.find({});

    res.send({
      dslangnghe: langnghe.length,
      dsdaily1: gsv.daily1.length,
      dsdaily2: gsv.daily2.length,
      dsdonhang: gsv.donhang.length,
      dssanpham: gsv.dssanpham.length,
      dscongcu: gsv.dscongcu.length,
      dsvattu: gsv.dsvattu.length,
      dsnguyenlieu: gsv.dsnguyenlieu.length,
      success: true,
    });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

module.exports = giamsatvungRouter;
