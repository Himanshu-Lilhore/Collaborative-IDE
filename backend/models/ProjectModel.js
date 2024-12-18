const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
    },
    githubLink: {
        type: String
    },
    liveLink: {
        type: String
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fileTree: {
        type: mongoose.Schema.Types.Mixed,    // tree of file structure stored in json format
        default: null
    },
    isPrivate: {
        type: Boolean,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {timestamps: true})


const Project = mongoose.model('Project', projectSchema)
module.exports = Project