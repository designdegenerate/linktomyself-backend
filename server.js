const express = require("express");
const mongoose = require("mongoose");
const app = express();
const PORT = 4000;
const pageRouter = require("./routers/pageRouter");
const authRouter = require("./routers/authRouter");
const { mongoURI } = require("./keys");

//TODO:
// 1. Integrate JWT, send it and integrate parser
// 2. setup cookies, send one and parse it

mongoose.connect(mongoURI);


app.use(express.json());

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
})

app.get("/", async(req, res) => {
  res.send("Welcome to my server!");
});

app.use("/page", pageRouter);

app.use("/auth", authRouter);