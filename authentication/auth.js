module.exports = {
    authorize: function(req, res, next) {
        if(req.user)    return next();

        req.flash("error", "you need to login first");
        res.redirect("/user/login");
    },

    disauthorize: function(req, res, next) {
        if(!req.user)   return next();

        req.flash("error", "you are already logged in");
        res.redirect("/dashboard");
    }
}