require("dotenv").config();
require("colors");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRouter = require("./router/authRouter.js");
const libraryRouter = require("./router/libraryRouter.js");
const studentRouter = require("./router/studentRouter.js");
const connectDB = require("./config/db.js");
const http = require("http");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());

app.use(
  bodyParser.json({
    limit: "30mb",
    extended: true,
  })
);

app.use(
  bodyParser.urlencoded({
    limit: "30mb",
    extended: true,
  })
);

app.use(morgan("tiny"));
app.use("/api/uploads", express.static("./uploads"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.disable("x-powered-by"); // less hackers know about our stack

// Connect to Database
connectDB();

const server = http.createServer(app);

app.use("/api/auth", authRouter);
app.use("/api/library", libraryRouter);
app.use("/api/student", studentRouter);

app.get("/", (req, res) => {
  res.send("Welcome, John Doe");
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.blue.underline.bold);
});
