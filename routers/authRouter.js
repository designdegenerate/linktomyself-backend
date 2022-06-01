const { Router } = require("express");
const User = require("../models/User");
const router = Router();
const bcrypt = require("bcrypt");
const Page = require("../models/Page");
const { jwtKey } = require("../keys");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send("Request is missing an email or password");

    let user = await User.exists({ email: email });
    if (!user) return res.status(400).send("email or password is incorrect");

    user = await User.findOne({ email: email });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(400).send("email or password is incorrect");

    const userSanitized = {...user._doc};
    delete userSanitized.password;

    const userPage = await Page.findOne({user: user._id});

    const token = jwt.sign({ userId: user._id }, jwtKey);

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .send({
        page: userPage,
        profile: userSanitized
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password, username, name } = req.body;

    if (!email || !password || !username || !name)
      return res
        .status(400)
        .send("Request is missing an email, password, username, or name");

    const emailExists = await User.exists({ email: email });
    if (emailExists)
      return res.status(400).send(`user with email: ${email} already exists`);

    const usernameExists = await User.exists({ username: username });
    if (usernameExists)
      return res
        .status(400)
        .send(`user with username: ${username} already exists`);

    //send back token and Page document

    const newUser = await User.create({
      email,
      password: bcrypt.hashSync(password, saltRounds),
      username,
      name,
    });

    const newPage = await Page.create({
      user: newUser._id,
      colors: {},
      permaLinks: [],
      oneLiner: "",
      bio: "",
      sectionOrdering: [],
      sections: [],
    });

    const userSanitized = {...newUser._doc};
    delete userSanitized.password;

    // const userSanitized = delete newUser.password;
    const token = jwt.sign({ userId: newUser._id }, jwtKey);

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .send({
        page: newPage,
        profile: userSanitized
      }
        );

  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
