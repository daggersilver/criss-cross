require("dotenv").config();

const express = require("express");
const { createServer } = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("./database/connection");
const passport = require("./authentication/passport");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: true, 
    saveUninitialized: true,
    // cookie: {
    //     sameSite: 'none',
    //     secure: true
    // }
}))
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.use((req, res, next) => {
    let date = require("moment")().format("YYYY");
    req.current_year = date;

    next();
})

const dashboardRouter = require("./routes/dashboard");
const userRouter = require("./routes/user");
const gameRouter = require("./routes/game");

app.use('/dashboard', dashboardRouter);
app.use('/user', userRouter);
app.use('/game', gameRouter);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get("/", (req, res) => {
    res.redirect("/dashboard");
})

app.get("*", (req, res) => {
    res.render("404");
})

const httpServer = createServer(app);
require("./socket/socket")(httpServer);

httpServer.listen(PORT, () => {
    console.log("server started at port " + PORT);
})