const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
    },
    sdt: String,
    email: String,
    cmnd: String,
    diachi: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
