require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const port = process.env.PORT || 8080;
const router = require("./src/controllers/index");
const logger = require("morgan");

const app = express();
const server = require("http").createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(logger("dev"));

app.use("/api", router);

app.get("/", async (req, res) => {
  return res.status(200).send("server is running");
});

server.listen(port, () => {
  console.log("Server is running at port : " + port);
});
