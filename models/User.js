const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true, 
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }, 
    score: {
        type: Number,
        required: true,
        default: 0
    },
    last_game: {
        type: String,
        default: ""
    },
    total_matches_won: {
        type: Number,
        required: true,
        default: 0
    },
    total_matches_played: {
        type: Number,
        required: true,
        default: 0
    },
    date_joined: {
        type: Date,
        required: true,
        default: Date.now()
    },
    profile_color: {
        type: String,
        required: true
    }
})

const User = mongoose.model('User', userSchema);
module.exports = User;