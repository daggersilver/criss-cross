const express = require("express");
const router = express.Router();
const { authorize } = require("../authentication/auth");
const moment = require("moment");

router.get("/", authorize , (req, res) => {
    res.render("index", {successes: req.flash("success"), 
                            errors: req.flash("error"),
                            user_details: JSON.stringify(req.user),
                            date_joined: moment(req.user.date_joined).format("LL")});
})

module.exports = router;