const express = require("express");
const Langnghe = require("../models/langngheModel");
const langngheRouter = express.Router();

// them lang nghe
langngheRouter.post("/them", async (req, res) => {
  const { gsvId, ten, tinh, huyen, loaisanpham } = req.body;
  try {
    const newLN = new Langnghe({
      ten,
      tinh,
      huyen,
      loaisanpham,
      giamsatvung: gsvId,
    });
    const savedLangnghe = await newLN.save();
    res.send({ savedLangnghe, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay ds langnghe
langngheRouter.get("/danhsach", async (req, res) => {
  try {
    const langnghe = await Langnghe.find({})
      .populate("loaisanpham")
      .sort({ createdAt: "desc" });
    if (!langnghe.length) {
      return res.send({
        message: "Không tìm thấy làng nghề nào",
        success: false,
      });
    }
    res.send({ langnghe, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay ds hodan
langngheRouter.get("/danhsachhodan/:langngheId", async (req, res) => {
  try {
    const { hodan } = await Langnghe.findById(req.params.langngheId)
      .select("hodan")
      .populate({
        path: "hodan",
        populate: {
          path: "langnghe",
        },
      });
    res.send({ hodan, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// lay thong tin 1 langnghe
langngheRouter.get("/single/:id", async (req, res) => {
  try {
    const langnghe = await Langnghe.findById(req.params.id).populate(
      "loaisanpham"
    );
    if (!langnghe) {
      return res.send({
        message: "Không tìm thấy làng nghề nào",
        success: false,
      });
    }
    res.send({ langnghe, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// chinh sua lang nghe
langngheRouter.put("/chinhsua/:id", async (req, res) => {
  const { ten, tinh, huyen, loaisanpham } = req.body;
  try {
    const langnghe = await Langnghe.findById(req.params.id);
    langnghe.ten = ten;
    langnghe.tinh = tinh;
    langnghe.huyen = huyen;
    langnghe.loaisanpham = loaisanpham;

    const updatedLangnghe = await langnghe.save();
    res.send({ updatedLangnghe, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

// xoa nhieu` langnghe
langngheRouter.put("/multiple", async (req, res) => {
  const { arrayOfId } = req.body;
  try {
    for (const item of arrayOfId) {
      await Langnghe.findByIdAndDelete(item);
    }
    res.send({ success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

module.exports = langngheRouter;
