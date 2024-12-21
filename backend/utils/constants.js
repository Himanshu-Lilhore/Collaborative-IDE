const defaultFileTree = {name: 'root', id: 'root', children: []};
const expiresIn1Hour = 3600000  // 3600000 ms // 1 hr
const tokenValidity = expiresIn1Hour
const sessionTokenValidity = expiresIn1Hour * 10
const idSeparator = '_-ID-_'     // name = name_-ID-_idnumber

module.exports = {defaultFileTree, expiresIn1Hour, tokenValidity, sessionTokenValidity, idSeparator};