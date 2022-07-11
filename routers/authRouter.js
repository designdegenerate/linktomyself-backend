require('dotenv').config()
const { Router } = require("express");
const User = require("../models/User");
const router = Router();
const bcrypt = require("bcrypt");
const Page = require("../models/Page");
// const { jwtKey, cloudinaryKeys } = require("../keys");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const { promisify } = require("util");
const { default: mongoose } = require("mongoose");
const unlinkAsync = promisify(fs.unlink);

cloudinary.config({
  cloud_name: process.env.cloudinaryKeysCloud_name,
  api_key: process.env.cloudinaryKeysApi_key,
  api_secret: process.env.cloudinaryKeysApi_secret,
});

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

    const token = jwt.sign({ userId: user._id }, process.env.jwtKey);

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

    if (!usernameRegex.test(username)) {
      return res
        .status(400)
        .send(
          "Username can only contain ASCII characters (aA–zZ, 0–9, '_', and '-')."
        );
    }

    if (username.length > 12) {
      return res
        .status(400)
        .send("Username cannot be longer than 12 characters");
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
      colors: {
        light: {
          name: "grey",
          lightFG: "#222",
          lightBG: "#f9f9f9",
        },
        dark: {
          name: "grey",
          darkFG: "#e1e1e1",
          darkBG: "#111",
        },
      },
      permaLinks: [],
      oneLiner: "",
      bio: "",
      sectionOrdering: [],
      sections: [],
    });

    const userSanitized = { ...newUser._doc };
    delete userSanitized.password;

    // const userSanitized = delete newUser.password;
    const token = jwt.sign({ userId: newUser._id }, process.env.jwtKey);

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
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user)
        return res
          .clearCookie("access_token")
          .status(404)
          .send("user no longer exists");

      user = await User.findOne({ _id: id.userId });

      const userSanitized = { ...user._doc };
      delete userSanitized.password;

      const userPage = await Page.findOne({ user: id.userId });

      res.send({
        page: userPage,
        profile: userSanitized,
      });
    } else {
      res.status(401).send("invalid or expired session");
    }
  } catch (error) {
    console.log(error);
  }
});

router.patch("/user", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });

      if (!user) {
        return res.status(404).send("user no longer exists");
      }

      user = await User.findOne({ _id: id.userId });
      const page = await Page.findOne({ user: id.userId });

      const data = Object.assign({}, ...req.body);

      // This is very verbose, but Mongoose is unreliable
      // Better safe than sorry

      if (data.email) {
        await user.updateOne({ email: data.email });
      }

      if (data.username) {
        await user.updateOne({ username: data.username });
      }
      if (data.name) {
        await user.updateOne({ name: data.name });
      }

      if (data.newPassword && !data.password) {
        return res
          .status(400)
          .send(
            "In order to change the password, the old password must also be sent"
          );
      } else if (data.newPassword) {
        if (!bcrypt.compareSync(data.password, user.password)) {
          return res.status(400).send("old password is incorrect");
        } else if (data.password && data.newPassword) {
          user.updateOne({
            password: bcrypt.hashSync(data.newPassword, saltRounds),
          });
        }
      }

      user.save();

      //Page DB
      if (data.oneLiner) {
        await page.updateOne({ oneLiner: data.oneLiner });
      }
      if (data.bio) {
        await page.updateOne({ bio: data.bio });
      }

      if (data.colors?.light) {
        page.colors.light = data.colors.light;
      }

      if (data.colors?.dark) {
        page.colors.dark = data.colors.dark;
      }

      page.save();

      return res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/user/image", upload.single("image"), async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user)
        return res
          .clearCookie("access_token")
          .status(404)
          .send("user no longer exists");

      page = await Page.findOne({ user: id.userId });

      if (!req.file) {
        res.status(401).send("No file was attached to the request");
      }

      const newImage = await cloudinary.uploader.upload(req.file.path);

      //Delete old image first if it exists
      if (page.profileImage?.public_id) {
        await cloudinary.uploader.destroy(page.profileImage.public_id);
      }

      const imgObj = {
        link: newImage.url,
        public_id: newImage.public_id,
      };

      //Update image
      await page.updateOne({ profileImage: imgObj });

      await unlinkAsync(req.file.path);

      res.send({ profileImage: imgObj });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong");
  }
});

router.delete("/user/image", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) {
        return res.status(404).send("user no longer exists");
      }

      //Get Image ID
      const page = await Page.findOne({ user: id.userId });

      if (!page.profileImage.link) {
        return res.status(400).send("user does not have a profile picture");
      }

      await cloudinary.uploader.destroy(page.profileImage.public_id);

      await page.updateOne({ profileImage: null });

      res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.patch("/user/delete", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      // if (!req.body._id) {
      //   return res.status(400).send("Missing link data");
      // }

      const page = await Page.findOne({ user: id.userId });

      if (page.profileImage?.link) {
        await cloudinary.uploader.destroy(page.profileImage.public_id);
      }

      await page.sections.map((sect) => {
        sect.content.map((card) => {
          cloudinary.uploader.destroy(card.imageId);
        });
      });

      await Page.findOneAndDelete({ user: id.userId });
      await User.findByIdAndDelete(id.userId);

      res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.post("/links", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });

      if (!user) {
        return res.status(404).send("user no longer exists");
      }

      page = await Page.findOne({ user: id.userId });

      if (!req.body.text || !req.body.link) {
        return res.status(400).send("Missing link data");
      }

      await page.permaLinks.push({
        text: req.body.text,
        link: req.body.link,
      });

      page.save();

      const newLink = await page.permaLinks[page.permaLinks.length - 1];

      return res.status(200).send(newLink);
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.patch("/links", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      if (!req.body._id || !req.body.text || !req.body.link) {
        return res.status(400).send("Missing link data");
      }

      await Page.findOneAndUpdate(
        { user: id.userId },
        {
          $set: {
            "permaLinks.$[i]": req.body,
          },
        },
        {
          arrayFilters: [
            {
              "i._id": req.body._id,
            },
          ],
        }
      );

      return res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

// Apparently it's not possible to send a delete
// request with cookies in Axios.

router.patch("/links/delete", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      if (!req.body._id) {
        return res.status(400).send("Missing link data");
      }

      page = await Page.findOne({ user: id.userId });

      await page.permaLinks.pull({ _id: req.body._id });

      page.save();

      return res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.post("/sections", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      if (!req.body.sectionName || !req.body.type || !req.body.contentType) {
        return res.status(400).send("missing data");
      }

      page = await Page.findOne({ user: id.userId });

      const { sectionName, type, contentType } = req.body;

      await page.sections.push({
        sectionName,
        type,
        contentType,
        fullLink: {
          link: " ",
          text: " ",
          visible: false,
        },
        content: [],
      });

      page.save();

      const newSection = await page.sections[page.sections.length - 1];

      return res.status(200).send(newSection);
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.patch("/sections/delete", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      if (!req.body._id) {
        return res.status(400).send("Missing link data");
      }

      const page = await Page.findOne({ user: id.userId });

      const getSection = await Page.aggregate([
        { $match: { user: mongoose.Types.ObjectId(id.userId) } },
        { $unwind: "$sections" },
        {
          $match: {
            "sections._id": mongoose.Types.ObjectId(req.body._id),
          },
        },
      ]);

      await getSection[0].sections.content.map((card) => {
        if (card.imageId) {
          cloudinary.uploader.destroy(card.imageId);
        }
      });

      await page.sections.pull({ _id: req.body._id });

      page.save();

      return res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.patch("/sections/details", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      if (!req.body._id) {
        return res.status(400).send("Missing an _id");
      }

      await Page.findOneAndUpdate(
        { user: id.userId },
        {
          $set: {
            "sections.$[i].fullLink.link": req.body.link,
            "sections.$[i].fullLink.text": req.body.text,
            "sections.$[i].fullLink.visible": req.body.visible,
          },
        },
        {
          arrayFilters: [
            {
              "i._id": req.body._id,
            },
          ],
        }
      );

      return res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.patch("/sections/cards", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      if (!req.body) {
        return res.status(400).send("Missing data");
      }

      await Page.findOneAndUpdate(
        { user: id.userId },
        {
          $set: {
            "sections.$[i].content.$[j]": req.body.data,
          },
        },
        {
          arrayFilters: [
            {
              "i._id": req.body.section_id,
            },
            {
              "j._id": req.body.data._id,
            },
          ],
        }
      );

      return res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.post(
  "/sections/cards/image",
  upload.single("image"),
  async (req, res) => {
    try {
      const cookies = req.cookies;

      if (cookies.access_token) {
        let id;

        try {
          id = jwt.verify(cookies.access_token, process.env.jwtKey);
        } catch (error) {
          res
            .clearCookie("access_token")
            .status(401)
            .send("invalid or expired session");
        }

        let user = await User.exists({ _id: id.userId });
        if (!user)
          return res
            .clearCookie("access_token")
            .status(404)
            .send("user no longer exists");

        page = await Page.findOne({ user: id.userId });

        if (!req.file) {
          res.status(401).send("No file was attached to the request");
        }

        if (req.body.imageId !== "undefined") {
          await cloudinary.uploader.destroy(req.body.imageId);
        }

        const newImage = await cloudinary.uploader.upload(req.file.path);

        await Page.findOneAndUpdate(
          { user: id.userId },
          {
            $set: {
              "sections.$[i].content.$[j].image": newImage.url,
              "sections.$[i].content.$[j].imageId": newImage.public_id,
            },
          },
          {
            arrayFilters: [
              {
                "i._id": req.body.section_id,
              },
              {
                "j._id": req.body._id,
              },
            ],
          }
        );

        await unlinkAsync(req.file.path);

        res.send({ image: newImage.url, imageId: newImage.public_id });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("something went wrong");
    }
  }
);

router.patch("/sections/cards/image/delete", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });

      if (!user)
        return res
          .clearCookie("access_token")
          .status(404)
          .send("user no longer exists");

      await cloudinary.uploader.destroy(req.body.imageId);

      await Page.findOneAndUpdate(
        { user: id.userId },
        {
          $set: {
            "sections.$[i].content.$[j].image": null,
            "sections.$[i].content.$[j].imageId": null,
          },
        },
        {
          arrayFilters: [
            {
              "i._id": req.body.section_id,
            },
            {
              "j._id": req.body._id,
            },
          ],
        }
      );

      res.send("");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong");
  }
});

router.post("/sections/cards", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      page = await Page.findOne({ user: id.userId });

      if (!req.body) {
        return res.status(400).send("Missing data");
      }

      await Page.findOneAndUpdate(
        { user: id.userId },
        {
          $push: {
            "sections.$[i].content": req.body.data,
          },
        },
        {
          arrayFilters: [
            {
              "i._id": req.body.section_id,
            },
          ],
        }
      );

      const getSection = await Page.aggregate([
        { $match: { user: mongoose.Types.ObjectId(id.userId) } },
        { $unwind: "$sections" },
        {
          $match: {
            "sections._id": mongoose.Types.ObjectId(req.body.section_id),
          },
        },
      ]);

      const content = getSection[0].sections.content;

      return res.status(200).send(content[content.length - 1]);
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.patch("/sections/cards/delete", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      let id;

      try {
        id = jwt.verify(cookies.access_token, process.env.jwtKey);
      } catch (error) {
        console.log(error);
        res
          .clearCookie("access_token")
          .status(401)
          .send("invalid or expired session");
      }

      let user = await User.exists({ _id: id.userId });
      if (!user) return res.status(404).send("user no longer exists");

      page = await Page.findOne({ user: id.userId });

      if (!req.body) {
        return res.status(400).send("Missing data");
      }

      await Page.findOneAndUpdate(
        { user: mongoose.Types.ObjectId(id.userId) },
        {
          $pull: {
            "sections.$[].content": {
              _id: mongoose.Types.ObjectId(req.body._id),
            },
          },
        }
      );

      return res.status(200).send("");
    } else {
      res.status(401).send("user is not logged in");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

module.exports = router;
