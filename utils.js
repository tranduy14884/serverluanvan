const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      taikhoan: user.taikhoan,
      vaitro: user.vaitro,
    },
    process.env.SECRET_KEY || "mytopsecret",
    {
      expiresIn: "300d",
    }
  );
};

exports.getCurrentDatetime = () => {
  let currentdate = new Date();
  return `${currentdate.getDate()}/${
    currentdate.getMonth() + 1
  }/${currentdate.getFullYear()}`;
};
