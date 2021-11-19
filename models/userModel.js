const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    taikhoan: {
      type: String,
      required: true,
    },
    matkhau: {
      type: String,
      required: true,
    },
    vaitro: {
      type: String,
      enum: ["admin", "bophankd", "giamsatvung", "daily1", "daily2", "hodan"],
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
