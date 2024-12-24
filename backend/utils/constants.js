const defaultFileTree = { id: 'root', name: 'root', isSaved: true, children: [] };
const expiresIn1Hour = 3600000  // 3600000 ms // 1 hr
const tokenValidity = expiresIn1Hour
const sessionTokenValidity = expiresIn1Hour * 10

module.exports = { defaultFileTree, expiresIn1Hour, tokenValidity, sessionTokenValidity };