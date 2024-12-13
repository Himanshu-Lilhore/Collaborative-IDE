const mongoose = require('mongoose')

const tempUserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
        minlength: 4
    },
    session: {
        type: String,
    }
}, {timestamps: true})

const TempUser = mongoose.model('TempUser', tempUserSchema)
module.exports = TempUser