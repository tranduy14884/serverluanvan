const express = require("express");
const adminRouter = express.Router();
const Admin = require("../models/adminModel");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// them admin
adminRouter.post("/them", async (req, res) => {
  const { ten, sdt, email, cmnd, diachi, taikhoan, matkhau } = req.body;
  try {
    // create account
    const newUser = new User({
      taikhoan,
      matkhau: bcrypt.hashSync(matkhau, 8),
      vaitro: "admin",
    });
    const savedUser = await newUser.save();
    // create admin collection document
    const newAdmin = new Admin({
      ten,
      sdt,
      email,
      cmnd,
      diachi,
      user: savedUser._id,
    });
    const savedAdmin = await newAdmin.save();
    res.send({ savedAdmin, success: true });
  } catch (error) {
    res.send({ message: error.message, success: false });
  }
});

module.exports = adminRouter;
