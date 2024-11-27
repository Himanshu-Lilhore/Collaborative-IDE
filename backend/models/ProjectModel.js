const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        unique: true
    },
    githubLink: {
        type: String
    },
    liveLink: {
        type: String
    },
    projectname: {
        type: String,
        require: true,
        minlength: 4
    },
    githubProjectname: {
        type: String,
        require: true,
        minlength: 4
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    fileTree: {
        type: mongoose.Schema.Types.Mixed,    // tree of file structure stored in json format
        default: null
    }
}, {timestamps: true})


const Project = mongoose.model('Project', projectSchema)
module.exports = Project