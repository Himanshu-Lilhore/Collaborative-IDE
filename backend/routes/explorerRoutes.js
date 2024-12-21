const express = require('express');
const router = express.Router();
const {authCheck} = require('../middlewares/authCheck')
const {createFile, createFolder, readFile, deleteFile, deleteFolder, updateFile, renameFolder} = require('../controllers/explorerController');

router.post('/createfile', createFile);
router.post('/readFile', readFile);
router.delete('/deleteFile', deleteFile);
router.put('/updateFile', updateFile);

router.post('/createfolder', createFolder);
router.delete('/deleteFolder', deleteFolder);
router.put('/renameFolder', renameFolder);

module.exports = router;
