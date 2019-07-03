const express = require("express");
const router = express.Router();

// @Route  GET api/users/test
// @Desc   Test Users route
// @Access Public
router.get("/test", (req, res) => res.json({ msg: "Users Funciona" }));

module.exports = router;
