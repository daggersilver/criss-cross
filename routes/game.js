const express = require("express");
const router = express.Router();
const { authorize } = require("../authentication/auth");

router.get("/:game_id", authorize , (req, res) => {
    res.render("game", {player_username: req.user.username});
})

module.exports = router;