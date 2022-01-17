require("dotenv").config();
const express = require("express");
const app = express();

const router = require("./src/router");

app.use(express.json());
app.use("/api/v1", router);

app.listen(process.env.PORT, () => {
  console.log(`The server is on port ${process.env.PORT}.`);
});
