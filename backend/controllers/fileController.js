const express = require('express');
const router = express.Router();
const { createFile, getFile, updateFile, deleteFile } = require('../services/fileService');

// create file
router.post('/create', async (req, res) => {
    const { fileName, fileContent, userId } = req.body;
    // console.log("reached here")
    try {
        const file = await createFile(fileName, fileContent, userId);
        res.send(file);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// get file
router.get('/read', async (req, res) => {
    try {
        const fileContent = await getFile(req.body._id);
        res.send(fileContent);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// update file
router.post('/update', async (req, res) => {
    const { fileId, fileName, fileContent, userId } = req.body;
    try {
        const updatedFile = await updateFile(fileId, fileName, fileContent, userId);
        res.status(200).json(updatedFile);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// delete file
router.delete('/delete', async (req, res) => {
    try {
        await deleteFile(req.body._id);
        res.status(200).send({ message: `File with ID ${req.body._id} deleted successfully.` });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


module.exports = router;