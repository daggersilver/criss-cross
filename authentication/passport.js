const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password"
},
    function (username, password, done) {
        User.findOne({ username: username }, (err, user) => {
            if (err) { 
                return done(err, false, {message: "server error, please try again later"}); 
            }
            if (!user) { 
                return done(null, false, {message: "user doesn't exists"}); 
            }
            
            bcrypt.compare(password, user.password)
            .then((matched) => {
                if(!matched) {
                    return done(null, false, {message: "password doesn't match"});
                }

                return done(null, user);
            })
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

module.exports = passport;