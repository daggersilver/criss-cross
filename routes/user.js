const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("../authentication/passport");
const { authorize, disauthorize } = require("../authentication/auth");
const User = require("../models/User");

router.get("/login", disauthorize, (req, res) => {
    res.render("login", {successes: req.flash("success"), 
                         errors: req.flash("error"),
                         current_year: req.current_year});
})

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/user/login', failureFlash: true }),
    (req, res) => {
        req.flash("success", "logged in successfully");
        res.redirect('/');
    });

router.get("/register", disauthorize, (req, res) => {
    res.render("register", {successes: req.flash("success"),
                            errors: req.flash("error"),
                            current_year: req.current_year});
})

router.post("/register", (req, res) => {
    let {username, email, password, password2} = req.body;
    const date_joined = new Date();

    if(!username || !email || !password || !password2) {
        req.flash("error", "fill in all the details");
        return res.redirect("/user/register");
    }

    if(password !== password2) {
        req.flash("error", "password and confirm password do not match");
        return res.redirect("/user/register");
    }
    else if(password.length < 8) {
        req.flash("error", "password length must be greater than or equal to 8 characters");
        return res.redirect("/user/register");
    }


    let anyError = false;
    const colors = ["#2596be", "#6c25be", "#be2596", "#49be25", "#ff0009", "#0009ff", "#006608", "#535654"];

    User.findOne({username})
    .then((user) => {
        if(user) {
            req.flash("error", "username already exists");
            anyError = true;
        }

        User.findOne({email})
        .then((user) => {
            if(user) {
                req.flash("error", "email is already linked with an account");
                anyError = true;
            }

            if(anyError) return res.redirect("/user/register");

            const SALT_ROUNDS = 10;

            bcrypt.hash(password, SALT_ROUNDS)
            .then((hashedPassword) => {
                const doc = User({username,
                    email,
                    password: hashedPassword,
                    date_joined,
                    profile_color: colors[Math.floor( Math.random() * colors.length )]
                });
                doc.save()
                .then((saved) => {
                    if(!saved) {
                        req.flash("error", "server error, try again later");
                        return res.redirect("/user/regiser");
                    }
                    req.flash("success", "successfully registered");
                    res.redirect("/user/login");
                })
                .catch((err) => console.log(err))
            })
            .catch((err) => console.log(err))
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
})

router.get("/logout", authorize, (req, res) => {
    req.logout();
    res.redirect("/user/login");
})

module.exports = router;