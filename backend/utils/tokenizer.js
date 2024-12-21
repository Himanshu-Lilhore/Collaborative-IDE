const jwt = require('jsonwebtoken');
const { tokenValidity, sessionTokenValidity } = require('../utils/constants')


function tokenize(username, email, timeInMs = tokenValidity){
    const token = jwt.sign(
        {username, email}, 
        process.env.SECRET_KEY, 
        {expiresIn: timeInMs}
    )
    console.log("New token generated !")
    return token
}

function tokenizeSession(sessionID, timeInMs = sessionTokenValidity){
    const token = jwt.sign(
        {sessionID}, 
        process.env.SECRET_KEY_SESSIONS, 
        {expiresIn: timeInMs}
    )
    console.log("New session token generated !")
    return token
}

module.exports = {tokenize, tokenizeSession};