const { Router } = require("express");
const User = require("../models/User");
const router = Router();

router.post("/login", async(req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) return res.status(400).send("Request is missing a email or password");

    let user = await User.exists({email: email});
    if(!user) return res.status(400).send("email or password is incorrect");

    //TODO: make secure with salting and friends
    user = await User.findOne({email: email});
    if(user.password !== password) return res.status(400).send("email or password is incorrect");

    //TODO: send page token

    res.send("page");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
})

router.post("/signup", async(req, res) => {
  try {
    res.send("page");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
})

module.exports = router;