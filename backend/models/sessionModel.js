const mongoose = require('mongoose')

const sessionSchema = new mongoose.Schema({
    isPrivate: {
        type: Boolean,
        required: true,
        default: false
    },
    password: {
        type: String
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionFileTree: {
        type: Object,
        required: true
    }
}, {timestamps: true})


const Session = mongoose.model('Session', sessionSchema)
module.exports = Session