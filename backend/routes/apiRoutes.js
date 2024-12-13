const express = require('express');
// const userRoutes = require('./userRoutes');
// const authRoutes = require('./authRoutes');
// const terminalRoutes = require('./terminalRoutes');
const fileController = require('../controllers/fileController');
const projectRoutes = require('./projectRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// router.use('/auth', authRoutes);       // Routes under /api/auth
// router.use('/terminal', terminalRoutes); // Routes under /api/terminal
router.use('/file', fileController);
router.use('/project', projectRoutes);
router.use('/user', userRoutes);

module.exports = router;
