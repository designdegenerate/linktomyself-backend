const { Router } = require("express");
const Page = require("../models/Page");
const User = require("../models/User");
const router = Router();

router.get("/:username", async (req, res) => {
  try {
    const user = await User
    .findOne({ username: req.params.username })

    //Can safely assume that no user means no page
    if (!user) return res.status(404).send("page not found");

    const page = await Page
    .findOne({user: user._id})
    .populate({
      path: 'user',
      select: '-_id -password -email',
    });

    res.send(page);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.post("/links", async (req, res) => {
  try {
    const cookies = req.cookies;

    if (cookies.access_token) {
      try {
        const id = jwt.verify(cookies.access_token, jwtKey);

        let user = await User.exists({ _id: id.userId });
        if (!user) return res.status(404).send("user no longer exists");

        page = await Page.findOne({ user: id.userId });

        //Page DB

        if (!req.body) {
          return res.status(400).send("Missing link data");
        }

          page.permaLinks.push({
            text: req.body.text,
            link: req.body.link
          })

        page.save();

        return res.status(200).send("");
      } catch (error) {
        console.log(error);
        res.status(401).send("invalid or expired session");
      }
    } else {
      res.status(401).send("user is not logged in");
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
})

module.exports = router;
