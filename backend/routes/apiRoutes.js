const express = require('express');
// const authRoutes = require('./authRoutes');
// const terminalRoutes = require('./terminalRoutes');
const projectRoutes = require('./projectRoutes');
const userRoutes = require('./userRoutes');
const sessionRoutes = require('./sessionRoutes');
const explorerRoutes = require('./explorerRoutes');
const router = express.Router();

// router.use('/auth', authRoutes);       // Routes under /api/auth
// router.use('/terminal', terminalRoutes); // Routes under /api/terminal
router.use('/explorer', explorerRoutes);
router.use('/project', projectRoutes);
router.use('/user', userRoutes);
router.use('/session', sessionRoutes);

module.exports = router;
