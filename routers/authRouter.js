const { Router } = require("express");
const User = require("../models/User");
const router = Router();
const bcrypt = require("bcrypt");
const Page = require("../models/Page");

router.post("/login", async(req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) return res.status(400).send("Request is missing an email or password");

    let user = await User.exists({email: email});
    if(!user) return res.status(400).send("email or password is incorrect");

    user = await User.findOne({email: email});
    if( !bcrypt.compareSync(password, user.password) ) return res.status(400).send("email or password is incorrect");

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

    const emailExists = await User.exists({email: email});
    if (emailExists) return res.status(400).send(`user with email: ${email} already exists`);

    const usernameExists = await User.exists({username: username});
    if (usernameExists) return res.status(400).send(`user with username: ${username} already exists`);

    //TODO: create new User document and Page document
    //send back token and Page document

    const newUser = await User.create({
      email, password, username, name
    })

    const newPage = await Page.create({
      name: newUser.name,
      username: newUser.username,
      userId: firstUser._id,
      colors: {},
      permaLinks: [],
      oneLiner: "",
      bio: "",
      sectionOrdering: [],
      sections: []
    });

    res.send(newPage);

  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
})

module.exports = router;