const express = require('express');
const router = express.Router();
const {authCheck} = require('../middlewares/authCheck')
const { createSession, getSession, joinSession } = require('../controllers/sessionController')

router.post('/create', authCheck, createSession)
router.post('/get', authCheck, getSession)
router.post('/join', authCheck, joinSession)

module.exports = router; 