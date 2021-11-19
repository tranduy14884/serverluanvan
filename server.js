const express = require("express");
const userRouter = require("./routers/userRouter");
const sanphamRouter = require("./routers/sanphamRouter");
const congcuRouter = require("./routers/congcuRouter");
const path = require("path");
const daily1Router = require("./routers/daily1Router");
const daily2Router = require("./routers/daily2Router");
const cors = require("cors");
const bophankdRouter = require("./routers/bophankdRouter");
const adminRouter = require("./routers/adminRouter");
const hodanRouter = require("./routers/hodanRouter");
const giamsatvungRouter = require("./routers/giamsatvungRouter");
const langngheRouter = require("./routers/langngheRouter");
const vattuRouter = require("./routers/vattuRouter");
const nguyenlieuRouter = require("./routers/nguyenlieuRouter");
const loaiSanphamRouter = require("./routers/loaiSanphamRouter");
const donhangRouter = require("./routers/donhangRouter");
const app = express();

app.use(cors());
require("dotenv").config();
require("./database/config")();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(path.resolve(), "/uploads")));

// loading routers
app.use("/api/admin", adminRouter);
app.use("/api/users", userRouter);
app.use("/api/bophankd", bophankdRouter);
app.use("/api/sanpham", sanphamRouter);
app.use("/api/congcu", congcuRouter);
app.use("/api/daily1", daily1Router);
app.use("/api/daily2", daily2Router);
app.use("/api/hodan", hodanRouter);
app.use("/api/gsv", giamsatvungRouter);
app.use("/api/langnghe", langngheRouter);
app.use("/api/vattu", vattuRouter);
app.use("/api/nguyenlieu", nguyenlieuRouter);
app.use("/api/loaisanpham", loaiSanphamRouter);
app.use("/api/donhang", donhangRouter);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
