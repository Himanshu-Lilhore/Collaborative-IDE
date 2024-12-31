const File = require('../models/fileModel.js')


const simplifyPath = (path) => {
    return path.replace(/[\//\\]/g, '')
}

const deleteAllFiles = async () => {
    await File.deleteMany()
    console.log('deleted all file from db')
}
module.exports = {
    simplifyPath, deleteAllFiles
}