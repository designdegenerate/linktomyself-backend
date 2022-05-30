const { Router } = require("express");
const Page = require("../models/Page");
const router = Router();

router.get("/:username", async (req, res) => {
  try {
    const userPage = await Page.findOne({ username: req.params.username });

    if (!userPage) return res.status(404).send("page not found");

    res.send(userPage);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

//TODO: patch request, require auth for that.

module.exports = router;