const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/crisscross');

mongoose.connection.on("connected", () => {
    console.log("database connected");
})

module.exports = mongoose;