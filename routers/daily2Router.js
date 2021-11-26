const express = require("express");
const Daily2 = require("../models/daily2Model");
const User = require("../models/userModel");
const daily2Router = express.Router();
var bcrypt = require("bcryptjs");
const Daily1 = require("../models/daily1Model");
const Hodan = require("../models/hodanModel");
const Giamsatvung = require("../models/giamsatvungModel");
const Bophankd = require("../models/bophankdModel");

// them dai ly
daily2Router.post("/them", async (req, res) => {
  const {
    ten,
    sdt,
    email,
    xa,
    huyen,
    tinh,
    taikhoan,
    daily1Id,
    bophankdId,
    gsvId,
  } = req.body;
  try {
    // create daily 1
    const daily2 = new Daily2({
      ten,
      sdt,
      email,
      xa,
      huyen,
      tinh,
      taikhoan,
      daily1: daily1Id,
    });
    const savedDaily2 = await daily2.save();

    if (savedDaily2) {
      // Thêm vào danh sách đại lý 2 của đại lý 1
      const daily1 = await Daily1.findById(daily1Id);
      daily1.daily2 = [savedDaily2._id, ...daily1.daily2];
      await daily1.save();
      // Thêm vào danh sách duyệt đại lý 2 của bộ phận kinh doanh
      const bophankd = await Bophankd.findById(bophankdId);
      bophankd.daily2 = [savedDaily2._id, ...bophankd.daily2];
      await bophankd.save();
      // Thêm vào danh sách duyệt đại lý 2 của giám sát vùng
      const gsv = await Giamsatvung.findById(gsvId);
      gsv.daily2 = [savedDaily2._id, ...gsv.daily2];
      await gsv.save();
    }

    res.send({ savedDaily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// chinh sua dai ly 2
daily2Router.put("/single/:id", async (req, res) => {
  const { ten, sdt, email, xa, huyen, tinh, matkhau } = req.body;
  try {
    const daily2 = await Daily2.findById(req.params.id);
    if (matkhau) {
      const user = await User.findById(daily2.user);
      user.matkhau = bcrypt.hashSync(matkhau, 8);
      await user.save();
    }
    daily2.ten = ten;
    daily2.sdt = sdt;
    daily2.email = email;
    daily2.xa = xa;
    daily2.huyen = huyen;
    daily2.tinh = tinh;
    const updatedDaily2 = await daily2.save();

    res.send({ updatedDaily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach dai ly 2
daily2Router.get("/danhsach", async (req, res) => {
  try {
    const daily2 = await Daily2.find({}).populate("user");
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

// lay thong tin 1 dai ly
daily2Router.get("/single/:id", async (req, res) => {
  try {
    const daily2 = await Daily2.findById(req.params.id)
      .populate({
        path: "hodan user donhang dscongcu dsvattu dsnguyenlieu",
      })
      .populate({
        path: "hodan",
        populate: {
          path: "langnghe loaisanpham",
        },
      })
      .populate({
        path: "dscongcu dsvattu dsnguyenlieu dssanpham",
        populate: {
          path: "donhang congcu vattu nguyenlieu sanpham",
        },
      });

    res.send({ daily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// xoa 1 daily2
daily2Router.delete("/single/:id", async (req, res) => {
  try {
    // xoa user
    const daily2 = await Daily2.findById(req.params.id);
    if (daily2.user) {
      await User.findByIdAndDelete(daily2.user);
    }
    // xoa bophankd
    const removedDaily2 = await Daily2.findByIdAndDelete(req.params.id);
    res.send({ removedDaily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// xoa nhieu` daily 2
daily2Router.put("/multiple", async (req, res) => {
  const { arrayOfId } = req.body;
  try {
    for (const item of arrayOfId) {
      // xoa user
      const daily2 = await Daily2.findById(item);
      if (daily2.user) {
        await User.findByIdAndDelete(daily2.user);
      }
      // xoa daily2
      await Daily2.findByIdAndDelete(item);
    }
    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// xoa nhieu` hodan thuoc dai ly 2
daily2Router.put("/xoanhieuhodan", async (req, res) => {
  const { daily2Id, arrayOfId } = req.body;
  // console.log(req.body);
  try {
    const daily2 = await Daily2.findById(daily2Id);
    for (const item of arrayOfId) {
      // update filed hodan, collection: Daily2
      daily2.hodan = daily2.hodan.filter((_item) => _item != item);
      await daily2.save();
      // update field daily2, collection: Hodan
      const hodan = await Hodan.findById(item);
      hodan.daily2 = null;
      await hodan.save();
    }
    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach dai ly 2 + daily1 null
daily2Router.get("/dsdly2dly1null", async (req, res) => {
  try {
    const dl2 = await Daily2.find({}).populate("user");
    if (!dl2.length) {
      return res.send({
        message: "Không tìm thấy đại lý 2 nào",
        success: false,
      });
    }
    const daily2 = dl2.filter((item) => !item.daily1);
    res.send({ daily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// daily 2 them ho dan
daily2Router.put("/themhodan", async (req, res) => {
  const { daily2Id, arrayOfId } = req.body;
  try {
    const daily2 = await Daily2.findById(daily2Id);
    for (const item of arrayOfId) {
      // update Daily2 collection, field: hodan
      daily2.hodan = [item, ...daily2.hodan];
      await daily2.save();
      // update Hodan collection, field: daily2
      const hodan = await Hodan.findById(item);
      hodan.daily2 = daily2Id;
      await hodan.save();
    }
    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach phan phat CONG CU thuoc dly2
daily2Router.get("/dsphanphat/:daily2Id", async (req, res) => {
  try {
    let { dsphanphat } = await Daily2.findById(req.params.daily2Id)
      .select("dsphanphat")
      .populate({
        path: "dsphanphat",
        populate: {
          path: "phanphat",
          populate: {
            path: "from to items",
            populate: {
              path: "bophankd daily1 daily2 hodan congcu",
            },
          },
        },
      });
    dsphanphat = dsphanphat.filter(
      (item) => item.phanphat.phanphattype === "congcu"
    );
    res.send({ dsphanphat, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach phan phat VAT TU thuoc dly2
daily2Router.get("/dsvattuphanphat/:daily2Id", async (req, res) => {
  try {
    let { dsphanphat } = await Daily2.findById(req.params.daily2Id)
      .select("dsphanphat")
      .populate({
        path: "dsphanphat",
        populate: {
          path: "phanphat",
          populate: {
            path: "from to items",
            populate: {
              path: "bophankd daily1 daily2 hodan vattu",
            },
          },
        },
      });
    dsphanphat = dsphanphat.filter(
      (item) => item.phanphat.phanphattype === "vattu"
    );

    res.send({ dsphanphat, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay 1 phan phat thuoc dly2
daily2Router.get("/singlephanphat/:daily2Id/:phanphatId", async (req, res) => {
  try {
    const { dsphanphat } = await Daily2.findById(req.params.daily2Id)
      .select("dsphanphat")
      .populate({
        path: "dsphanphat",
        populate: {
          path: "phanphat",
          populate: {
            path: "from to items",
            populate: {
              path: "bophankd daily1 daily2 hodan congcu vattu",
            },
          },
        },
      });
    const phanphat = dsphanphat.find(
      (item) => item.phanphat._id.toString() === req.params.phanphatId
    );
    res.send({ phanphat, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach CONG CU thuoc daily 2
daily2Router.get("/danhsachcongcu/:daily2Id", async (req, res) => {
  try {
    let dscongcu = await Daily2.findById(req.params.daily2Id)
      .select("items")
      .populate({
        path: "items",
        populate: {
          path: "phanphat",
          populate: {
            path: "from to",
            populate: {
              path: "bophankd daily1 daily2 hodan",
            },
          },
        },
      })
      .populate({
        path: "items",
        populate: {
          path: "congcu vattu",
        },
      });

    if (!dscongcu) {
      return res.send({
        message: "Không có công cụ nào trong kho",
        success: false,
      });
    }
    dscongcu = dscongcu.items.filter((item) => item.congcu);
    res.send({ dscongcu, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach VAT TU thuoc daily 2
daily2Router.get("/danhsachvattu/:daily2Id", async (req, res) => {
  try {
    let dsvattu = await Daily2.findById(req.params.daily2Id)
      .select("items")
      .populate({
        path: "items",
        populate: {
          path: "phanphat",
          populate: {
            path: "from to",
            populate: {
              path: "bophankd daily1 daily2 hodan",
            },
          },
        },
      })
      .populate({
        path: "items",
        populate: {
          path: "congcu vattu",
        },
      });

    if (!dsvattu) {
      return res.send({
        message: "Không có công cụ nào trong kho",
        success: false,
      });
    }
    dsvattu = dsvattu.items.filter((item) => item.vattu);
    res.send({ dsvattu, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// get single daily2 based userId
daily2Router.get("/user/:id", async (req, res) => {
  try {
    const daily2 = await Daily2.findOne({ user: req.params.id });
    if (!daily2) {
      return res.send({ message: "Không tìm thấy đại lý", success: false });
    }
    res.send({ daily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// ===========================================

// them dai ly 2 vao ds daily2 cua daily1
daily2Router.post("/them", async (req, res) => {
  const { ten, sdt, email, diachi, taikhoan, matkhau, daily1 } = req.body;

  try {
    // tao tai khoan de lay userId
    let savedUser;
    if (taikhoan && matkhau) {
      const newUser = new User({
        taikhoan,
        matkhau: bcrypt.hashSync(matkhau, 8),
        vaitro: "daily2",
      });
      savedUser = await newUser.save();
    }

    // luu thong tin dai ly
    const newDaily2 = new Daily2({
      ten,
      sdt,
      email,
      diachi,
      daily1,
      user: savedUser ? savedUser._id : null,
    });
    const savedDaily2 = await newDaily2.save();

    // update daily1: daily2[] field
    const dl1 = await Daily1.findById(daily1);
    dl1.daily2 = [savedDaily2._id, ...dl1.daily2];
    await dl1.save();

    res.send({ savedDaily2, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

//======================

// lay ds don hang thuoc daily2
daily2Router.get("/dsdonhang/:daily2Id", async (req, res) => {
  try {
    let { donhang } = await Daily2.findById(req.params.daily2Id)
      .select("donhang")
      .populate("donhang");

    res.send({ donhang, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach hodan thuoc daily2
daily2Router.get("/dshodan/:daily2Id", async (req, res) => {
  try {
    let { hodan } = await Daily2.findById(req.params.daily2Id)
      .select("hodan")
      .populate({
        path: "hodan",
        populate: {
          path: "langnghe loaisanpham user",
        },
      });
    if (!hodan.length) {
      return res.send({
        message: "Không tìm thấy đại lý 2 nào",
        success: false,
      });
    }

    res.send({ hodan, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay danh sach SUB don hang thuoc daily2
daily2Router.get("/dssubdonhang/:daily2Id/:ma", async (req, res) => {
  try {
    let { subdonhang } = await Daily2.findById(req.params.daily2Id)
      .select("subdonhang")
      .populate({
        path: "subdonhang",
        populate: {
          path: "from to dssanpham dscongcu dsvattu dsnguyenlieu",
          populate: {
            path: "daily2 hodan sanpham congcu vattu nguyenlieu",
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

// lay danh sach sanpham thuoc Daily2
daily2Router.get("/dssanpham/:daily2Id", async (req, res) => {
  try {
    const { dssanpham } = await Daily2.findById(req.params.daily2Id)
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

// lay danh sach vattu thuoc Daily2
daily2Router.get("/dsvattu/:daily2Id", async (req, res) => {
  try {
    let { dsvattu } = await Daily2.findById(req.params.daily2Id)
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

// lay danh sach nguyenlieu thuoc Daily1
daily2Router.get("/dsnguyenlieu/:daily2Id", async (req, res) => {
  try {
    const { dsnguyenlieu } = await Daily2.findById(req.params.daily2Id)
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

// lay danh sach congcu thuoc Daily2
daily2Router.get("/dscongcu/:daily2Id", async (req, res) => {
  try {
    let { dscongcu } = await Daily2.findById(req.params.daily2Id)
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
daily2Router.get("/tongquan/:daily2Id", async (req, res) => {
  try {
    let daily2 = await Daily2.findById(req.params.daily2Id);

    res.send({
      dssanpham: daily2.dssanpham.length,
      dscongcu: daily2.dscongcu.length,
      dsvattu: daily2.dsvattu.length,
      dsnguyenlieu: daily2.dsnguyenlieu.length,
      dshodan: daily2.hodan.length,
      dsdonhang: daily2.donhang.length,
      success: true,
    });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay ds donhang chua duyet hien thi badge
daily2Router.get("/dsshowbadge/:daily2Id", async (req, res) => {
  try {
    let { donhang } = await Daily2.findById(req.params.daily2Id)
      .select("donhang")
      .populate("donhang");
    donhang = donhang.filter((dh) => !dh.xacnhan);

    res.send({ donhangBadge: donhang.length, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

module.exports = daily2Router;
