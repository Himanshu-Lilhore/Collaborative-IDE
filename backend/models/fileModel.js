const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    data: {
        type: String | null,
        default: null
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})

const File = mongoose.model('File', fileSchema)
module.exports = File