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

module.exports = router;
