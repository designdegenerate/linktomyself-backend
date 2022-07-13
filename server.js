require('dotenv').config()
const express = require("express");
const mongoose = require("mongoose");
const corsMiddleWare = require("cors");
const cookiemiddleWare = require("cookie-parser");
const pageRouter = require("./routers/pageRouter");
const authRouter = require("./routers/authRouter");

const app = express();
const PORT = 4000;

mongoose.connect(process.env.mongoURI);

app.use(corsMiddleWare({
  preflightContinue: true,
  origin: process.env.frontEndServer,
  credentials: true,
}));

app.use(cookiemiddleWare());

const bodyParserMiddleWare = express.json();
app.use(bodyParserMiddleWare);

app.listen( process.env.PORT || PORT, () => {
  console.log(`Listening on port: ${process.env.PORT || 4000}`);
})

app.get("/", async(req, res) => {
  res.send("Welcome to my server!");
});

app.use("/page", pageRouter);

app.use("/auth", authRouter);