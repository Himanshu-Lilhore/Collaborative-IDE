const { GridFSBucket } = require('mongodb');
const File = require('../models/fileModel');
const mongoose = require('mongoose');
const Readable = require('stream').Readable;
const fs = require('fs');
const path = require('path');
const {
    createFileLocally,
    createFolderLocally,
    readFileLocally,
    deleteFileLocally,
    deleteFolderLocally,
    updateFileLocally,
    renameFolderLocally
} = require('../services/fileService');
const { create } = require('../models/userModel');


// create file
const createFile = async (req, res) => {
    try {
        const { fileName, fileContent, userId } = req.body;
        const fileSizeInMB = Buffer.byteLength(fileContent, 'utf-8') / (1024 * 1024);
        let file;

        // creating file in user dir
        createFileLocally(fileName, fileContent);

        // creating file in db
        if (fileSizeInMB <= 10) {
            file = await File.create({
                name: fileName,
                data: fileContent,
                lastUpdatedBy: userId
            });
            console.log('File saved directly in MongoDB.');
        } else {
            file = await File.create({
                name: fileName,
                lastUpdatedBy: userId
            });

            const bucket = new GridFSBucket(mongoose.connection.getClient().db());
            const uploadStream = bucket.openUploadStreamWithId(file._id, fileName);

            await new Promise((resolve, reject) => {
                const stream = Readable.from([fileContent]);
                stream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });

            file.data = `gridfs.${file._id}`;   // "gridfs.<gridfs_obj_id>"
            await file.save();
            console.log('Large file saved in GridFS and reference updated.');
        }
        res.status(200).json(file);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// read file
const readFile = async (req, res) => {
    try {
        let file = await File.findById(req.body._id);
        if (!file) throw new Error('File not found');

        if (file.data) {
            if (file.data.startsWith('gridfs.')) {
                const gridFsId = file.data.split('.')[1];

                const bucket = new GridFSBucket(mongoose.connection.getClient().db());
                const downloadStream = bucket.openDownloadStream(gridFsId);

                const chunks = [];
                await new Promise((resolve, reject) => {
                    downloadStream
                        .on('data', (chunk) => chunks.push(chunk))
                        .on('error', reject)
                        .on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
                });

                file.data = Buffer.concat(chunks).toString('utf-8');
            }
        }
        res.status(200).json(file);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// update file
const updateFile = async (req, res) => {
    const { fileId, fileName, fileContent, userId } = req.body;
    try {
        const file = await File.findById(fileId);
        if (!file) throw new Error('File not found');

        const fileSizeInMB = Buffer.byteLength(newFileContent, 'utf-8') / (1024 * 1024);

        file.name = newFileName || file.name;
        file.lastUpdatedBy = userId || file.lastUpdatedBy;

        if (fileSizeInMB <= 10) {
            if (file.data && file.data.startsWith('gridfs.')) {
                // if file was >10 previously, then we delete its prev gridfs obj
                const gridFsId = file.data.split('.')[1];
                const bucket = new GridFSBucket(mongoose.connection.getClient().db());
                await bucket.delete(new mongoose.Types.ObjectId(gridFsId));
                console.log('File deleted from GridFS.');
            }
            file.data = newFileContent;
            await file.save();
            console.log('File updated directly in MongoDB.');
        } else {
            const bucket = new GridFSBucket(mongoose.connection.getClient().db());
            const uploadStream = bucket.openUploadStreamWithId(file._id, file.name);

            await new Promise((resolve, reject) => {
                const stream = Readable.from([newFileContent]);
                stream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });

            file.data = `gridfs.${file._id}`;    // "gridfs.<gridfs_obj_id>"
            await file.save();
            console.log('Large file updated in GridFS and reference updated.');
        }
        res.status(200).json(file);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// delete file
const deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.body._id);
        if (!file) throw new Error('File not found');

        if (file.data && file.data.startsWith('gridfs.')) {
            const gridFsId = file.data.split('.')[1];
            const bucket = new GridFSBucket(mongoose.connection.getClient().db());
            await bucket.delete(new mongoose.Types.ObjectId(gridFsId));
            console.log('File deleted from GridFS.');
        }

        await File.deleteOne({ _id: fileId });
        console.log('File deleted from MongoDB.');
        res.status(200).json({ message: `File with ID ${req.body._id} deleted successfully.` });
    } catch (error) {
        res.status(500).send(error.message);
    }
};


const createFolder = async (req, res) => {
    try {
        
        res.status(200).json();
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const renameFolder = async (req, res) => {
    try {
        
        res.status(200).json();
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const deleteFolder = async (req, res) => {
    try {
        
        res.status(200).json();
    } catch (error) {
        res.status(500).send(error.message);
    }
};

module.exports = { createFile, createFolder, readFile, deleteFile, deleteFolder, updateFile, renameFolder };