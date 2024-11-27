const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    bio: {
        type: String
    },
    username: {
        type: String,
        require: true,
        minlength: 4
    },
    githubUsername: {
        type: String,
        require: true,
        minlength: 4
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    session: {
        type: String,
    }
}, {timestamps: true})

const User = mongoose.model('User', userSchema)
module.exports = User