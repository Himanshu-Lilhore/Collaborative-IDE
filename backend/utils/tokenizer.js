const jwt = require('jsonwebtoken');

function tokenize(username, email, timeInMs=3600000 * 1){
    const token = jwt.sign(
        {username, email}, 
        process.env.SECRET_KEY, 
        {expiresIn: timeInMs}
    )
    console.log("New token generated !")
    return token
}

function tokenizeSession(sessionID, timeInMs=3600000 * 10){
    const token = jwt.sign(
        {sessionID}, 
        process.env.SECRET_KEY_SESSIONS, 
        {expiresIn: timeInMs}
    )
    console.log("New session token generated !")
    return token
}

module.exports = {tokenize, tokenizeSession};