const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const {tokenize} = require('../utils/tokenizer');
const { generateUsername } = require("unique-username-generator");   // https://www.npmjs.com/package/unique-username-generator


async function getUniqueUsername() {
    let username, condition
    do {
        username = generateUsername("", 0, 15)
        condition = await User.findOne({ username })
    } while (condition)
    return username
}

const excludeSensitive = (dataMap) => {
    dataMap = dataMap.toObject()
    const sensitive = ['__v', 'createdAt', 'updatedAt', 'password']
    const filteredKeys = Object.keys(dataMap).filter(key => !sensitive.includes(key))
    let cleanData = {}
    filteredKeys.forEach(key => cleanData[key] = dataMap[key])
    return (cleanData)
}

const login = async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email })
        if (!userExists) {
            return res.status(404).send("User does not exist")
        }
        const passwordMatches = await bcrypt.compare(req.body.password, userExists.password)
        if (!passwordMatches) {
            return res.status(401).send("wrong password or email address")
        }

        const expiresInMs = 3600000 * 1  // 1 hr = 3600000 ms
        if (userExists && passwordMatches) {
            const token = tokenize(userExists.username, userExists.email, expiresInMs)
            res.cookie('token', token, { httpOnly: true, maxAge: expiresInMs, sameSite: 'None', secure: true })
            console.log(`tokenized : ${token}`)
            console.log("\nUser logged in successfully.\n")
            return res.status(200).json(excludeSensitive(userExists))
        } else {
            res.clearCookie('token', {
                httpOnly: true,
                secure: true,
                sameSite: 'None'
            })
            return res.status(400).json("Invalid user  OR  wrong username-password ")
        }
    } catch (e) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        return res.status(500).json({ message: e })
    }
}



const registerUser = async (req, res) => {
    const username = await getUniqueUsername()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    try {
        if (
            req.body.fname && req.body.fname.length < 20 &&
            req.body.lname && req.body.lname.length < 20 &&
            req.body.email && emailRegex.test(req.body.email) &&
            req.body.password && req.body.password.length > 6 && req.body.password.length < 20
        ) {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const newUser = await User.create({
                ...req.body,
                password: hashedPassword,
                username: username
            })
            console.log("User created !!")
            res.status(200).json("User created..")
        }
        else {
            console.log("\nRejected user creation, input criteria not followed !\n")
            return res.status(401).send({ message: "Rejected user creation, input criteria not followed !" })
        }
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}


// fetch a profile using ID or username (ONLY FOR LOGGEDIN USER)
const viewProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(404).json({ error: 'User not found' })
        }

        return res.status(200).json(excludeSensitive(req.user))  // comes from auth middleware
    } catch (err) {
        console.log("\nFailed to fetch user details !\n")
        res.status(400).json({ error: err.message })
    }
}


const editUserProfile = async (req, res) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    try {
        const { fname, lname, email, username, bio } = req.body;
        const userId = req.user._id;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (username.length > 15 || username < 4) {
            return res.status(400).json({ message: 'Username should be between 3 and 15 characters in length' });
        }

        const existingUser = await User.findOne({ username: username, _id: { $ne: userId } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const existingEmail = await User.findOne({ email: email, _id: { $ne: userId } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { fname, lname, username, bio, email }, { new: true });

        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        const token = tokenize(username, email)
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 * 1, sameSite: 'None', secure: true })

        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (e) {
        return res.status(400).json({ message: e });
    }
}


const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        res.status(200).json({ message: 'Logged out successfully !' })
    } catch (err) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        })
        res.status(400).json({ message: "Failed to logout !" })
    }
}


module.exports = { registerUser, viewProfile, login, editUserProfile, logout }
