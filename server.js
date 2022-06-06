const express = require("express");
const mongoose = require("mongoose");
const corsMiddleWare = require("cors");
const pageRouter = require("./routers/pageRouter");
const authRouter = require("./routers/authRouter");
const { mongoURI, frontEndServer } = require("./keys");

const app = express();
const PORT = 4000;

//TODO:
// 1. Integrate JWT, send it and integrate parser
// 2. setup cookies, send one and parse it

mongoose.connect(mongoURI);

app.use(corsMiddleWare({
  preflightContinue: true,
  origin: frontEndServer,
  credentials: true,

}));

const bodyParserMiddleWare = express.json();
app.use(bodyParserMiddleWare);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
})

app.get("/", async(req, res) => {
  res.send("Welcome to my server!");
});

app.use("/page", pageRouter);

app.use("/auth", authRouter);