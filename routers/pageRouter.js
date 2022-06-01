const { Router } = require("express");
const Page = require("../models/Page");
const User = require("../models/User");
const router = Router();

router.get("/:username", async (req, res) => {
  try {
    const userPage = await User
    .findOne({ username: req.params.username })
    .populate({
      path: 'page',
    });


    if (!userPage) return res.status(404).send("page not found");

    res.send(userPage.page);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

//TODO: patch request, require auth for that.

module.exports = router;
