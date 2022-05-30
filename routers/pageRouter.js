const { Router } = require("express");
const router = Router();

router.get("/", async(req, res) => {
  try {
    res.send("page");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }

})

module.exports = router;