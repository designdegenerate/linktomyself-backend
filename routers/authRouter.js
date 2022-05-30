const { Router } = require("express");
const User = require("../models/User");
const router = Router();

router.post("/login", async(req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) return res.status(400).send("Request is missing an email or password");

    let user = await User.exists({email: email});
    if(!user) return res.status(400).send("email or password is incorrect");

    //TODO: make secure with salting and friends
    user = await User.findOne({email: email});
    if(user.password !== password) return res.status(400).send("email or password is incorrect");

    //TODO: send page token

    res.send("login successful");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
})

router.post("/signup", async(req, res) => {
  try {
    const {email, password, username, name} = req.body;

    if (!email || !password || !username || !name) return res.status(400).send("Request is missing an email, password, username, or name");

    //TODO: create new User document and Page document
    //send back token and Page document

    res.send("signup succesful");

  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
})

module.exports = router;