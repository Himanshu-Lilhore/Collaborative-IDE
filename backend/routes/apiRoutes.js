const express = require('express');
// const userRoutes = require('./userRoutes');
// const authRoutes = require('./authRoutes');
// const terminalRoutes = require('./terminalRoutes');
const fileController = require('../controllers/fileController');
const projectRoutes = require('./projectRoutes');

const router = express.Router();

// router.use('/user', userRoutes);       // Routes under /api/user
// router.use('/auth', authRoutes);       // Routes under /api/auth
// router.use('/terminal', terminalRoutes); // Routes under /api/terminal
router.use('/file', fileController);
router.use('/project', projectRoutes);

module.exports = router;
