const express = require('express');
const router = express.Router();
const {registerUser, viewProfile, login, editUserProfile, logout } = require('../controllers/userController')
const {authCheck} = require('../middlewares/authCheck')

router.get('/profile', authCheck, viewProfile)

router.put('/profile-update', authCheck, editUserProfile)

router.post('/login', login)
router.post('/logout', logout)
router.post('/register', registerUser)


module.exports = router; 