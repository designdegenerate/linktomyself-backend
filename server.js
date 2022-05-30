const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
const authKey = require("./auth");
const pageRouter = require("./routers/pageRouter");
const authRouter = require("./routers/authRouter");

mongoose.connect(authKey);


app.use(express.json());

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
})

app.get("/", async(req, res) => {
  res.send("Welcome to my server!");
});

app.use("/page", pageRouter);

app.use("/auth", authRouter);