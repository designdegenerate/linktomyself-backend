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

    const userSanitized = { ...user._doc };
    delete userSanitized.password;

    const userPage = await Page.findOne({ user: user._id });

    const token = jwt.sign({ userId: user._id }, jwtKey);

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .send({
        page: userPage,
        profile: userSanitized,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.get("/logout", async (req, res) => {
  res.clearCookie("access_token").send("");
});

router.post("/register", async (req, res) => {
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const usernameRegex = /^^[a-zA-Z0-9_.-]*$/;

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

    if (!emailRegex.test(email)) {
      return res.status(400).send("Email is not valid");
    }

    if ( !usernameRegex.test(username)) {
      return res.status(400).send("Username can only contain ASCII characters (aA–zZ, 0–9, '_', and '-').");
    }
    
    if (username.length > 12) {
      return res.status(400).send("Username cannot be longer than 12 characters");
    }

    if (password.length < 8) {
      return res.status(400).send("Password must be at least 8 characters");
    }

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

    const userSanitized = { ...newUser._doc };
    delete userSanitized.password;

    // const userSanitized = delete newUser.password;
    const token = jwt.sign({ userId: newUser._id }, jwtKey);

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(201)
      .send({
        page: newPage,
        profile: userSanitized,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

// Path to return current user.
// GET returns the user's profile + page
// if a valid JWT token is sent as a cookie
// PATCH modifies the current user's profile

router.get("/user", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      try {
        const id = jwt.verify(cookies.access_token, jwtKey);

        let user = await User.exists({ userId: id.userId });
        if (!user) return res.status(404).send("user no longer exists");

        user = await User.findOne({ userId: id.userId });

        const userSanitized = { ...user._doc };
        delete userSanitized.password;

        const userPage = await Page.findOne({ userId: id.userId });

        res.send({
          page: userPage,
          profile: userSanitized,
        });
      } catch (error) {
        res.status(401).send("invalid or expired JWT key sent");
      }
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
  }
});

router.patch("/user", async (req, res) => {
  try {
    const cookies = req.cookies;
    const { email, username, name, password, newPassword } = req.body;

    if (cookies.access_token) {
      try {
        const id = jwt.verify(cookies.access_token, jwtKey);

        let user = await User.exists({ userId: id.userId });
        if (!user) return res.status(404).send("user no longer exists");

        user = await User.findOne({ userId: id.userId });

        if (email) return await user.update({ email: email });
        if (username) return await user.update({ username: username });
        if (name) return await user.update({ username: name });

        if (newPassword && !password)
          return res
            .status(400)
            .send(
              "In order to change the password, the old password must also be sent"
            );

        if (!bcrypt.compareSync(password, user.password)) {
          return res.status(400).send("old password is incorrect");
        } else if (password && newPassword) {
          user.update({ password: bcrypt.hashSync(newPassword, saltRounds) });
        }

        user.save();

        res.status(200).send();
      } catch (error) {
        res.status(401).send("invalid or expired session");
      }
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
  }
});

router.put("/user/password", async (req, res) => {});

module.exports = router;
