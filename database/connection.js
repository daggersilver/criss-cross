const mongoose = require('mongoose');
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.s6okb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`);

mongoose.connection.on("connected", () => {
    console.log("database connected");
})

module.exports = mongoose;