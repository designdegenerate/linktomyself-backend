const express = require("express");
const app = express();
const PORT = 3000;
const authKey = require("./auth");

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
})

app.get("/", async(req, res) => {
  res.send("Welcome to my server!");
});