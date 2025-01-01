const { GridFSBucket } = require('mongodb');
const File = require('../models/fileModel');
const mongoose = require('mongoose');
const Readable = require('stream').Readable;
const fs = require('fs');
const globalState = require('../utils/state');
const { simplifyPath } = require('../utils/utilFunctions');
const path = require('path');
const baseDir = path.join(__dirname, '../user');


const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};
const createFileLocally = (fileName, content) => {
    try {
        ensureDirectoryExists(baseDir);
        const filePath = path.join(baseDir, fileName);
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`File created at: ${filePath}`);
        return filePath;
    } catch (error) {
        console.error(`Error creating file: ${error.message}`);
        throw error;
    }
};
const createFolderLocally = (folderName) => {
    try {
        const folderPath = path.join(baseDir, folderName);
        ensureDirectoryExists(folderPath);
        console.log(`Folder created at: ${folderPath}`);
        return folderPath;
    } catch (error) {
        console.error(`Error creating folder: ${error.message}`);
        throw error;
    }
};


// create file
const createFile = async (filePath, userId) => {
    const fileName = filePath.split('/').pop();

    const file = await File.create({
        name: fileName,
        data: '//blank',
        lastUpdatedBy: userId,
    });

    globalState.filePathToIdMap.set(simplifyPath(filePath), file._id)

    createFileLocally(fileName, '');
};

// create folder
const createFolder = async (folderPath) => {
    const folderName = folderPath.split('/').pop();

    createFolderLocally(folderName);
};


// const createFile = async (req, res) => {
//     try {
//         const { fileName, fileContent, userId } = req.body;
//         const fileSizeInMB = Buffer.byteLength(fileContent, 'utf-8') / (1024 * 1024);
//         let file;

//         // creating file in user dir
//         createFileLocally(fileName, fileContent);

//         // creating file in db
//         if (fileSizeInMB <= 10) {
//             file = await File.create({
//                 name: fileName,
//                 data: fileContent,
//                 lastUpdatedBy: userId
//             });
//             console.log('File saved directly in MongoDB.');
//         } else {
//             file = await File.create({
//                 name: fileName,
//                 lastUpdatedBy: userId
//             });

//             const bucket = new GridFSBucket(mongoose.connection.getClient().db());
//             const uploadStream = bucket.openUploadStreamWithId(file._id, fileName);

//             await new Promise((resolve, reject) => {
//                 const stream = Readable.from([fileContent]);
//                 stream.pipe(uploadStream)
//                     .on('error', reject)
//                     .on('finish', resolve);
//             });

//             file.data = `gridfs.${file._id}`;   // "gridfs.<gridfs_obj_id>"
//             await file.save();
//             console.log('Large file saved in GridFS and reference updated.');
//         }
//         res.status(200).json(file);
//     } catch (error) {
//         res.status(500).send(error.message);
//     }
// };

function isUUIDv4(uuid) {
    const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidv4Regex.test(uuid);
}
const findAndUpdateNodeById = (tree, targetId, newId) => {
    if (!Array.isArray(tree)) return null;

    for (const node of tree) {
        if (node.id === targetId) {
            console.log(`Node found with ID: ${targetId}`);
            node.id = newId;
            return node;
        }

        if (Array.isArray(node.children)) {
            const updatedNode = findAndUpdateNodeById(node.children, targetId, newId);
            if (updatedNode) return updatedNode;
        }
    }
    return null; 
};


// read file
const readFile = async (node) => {
    try {
        let file = await File.findById(node.id);
        if (!file || isUUIDv4(node.id)) {
            console.log("has uuid as id, creating new")
            file = await File.create({
                name: node.name,
                data: '//blank',
                lastUpdatedBy: null,
            });
            findAndUpdateNodeById(globalState.sessionFileTree, node.id, file._id)
            return file
        }

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

        return file;
    } catch (error) {
        console.log(error.message)
    }
};

// update file
const updateFile = async (newInfo) => {
    const { fileId, fileName, content, userId } = newInfo;
    try {
        const file = await File.findById(fileId);
        if (!file) throw new Error('File not found');

        const fileSizeInMB = Buffer.byteLength(content, 'utf-8') / (1024 * 1024);

        file.name = fileName || file.name;
        file.lastUpdatedBy = userId || file.lastUpdatedBy;

        if (fileSizeInMB <= 10) {
            if (file.data && file.data.startsWith('gridfs.')) {
                // if file was >10 previously, then we delete its prev gridfs obj
                const gridFsId = file.data.split('.')[1];
                const bucket = new GridFSBucket(mongoose.connection.getClient().db());
                await bucket.delete(new mongoose.Types.ObjectId(gridFsId));
                console.log('File deleted from GridFS.');
            }
            file.data = content;
            await file.save();
            console.log('File updated directly in MongoDB.');
        } else {
            const bucket = new GridFSBucket(mongoose.connection.getClient().db());
            const uploadStream = bucket.openUploadStreamWithId(file._id, file.name);

            await new Promise((resolve, reject) => {
                const stream = Readable.from([content]);
                stream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });

            file.data = `gridfs.${file._id}`;    // "gridfs.<gridfs_obj_id>"
            await file.save();
            console.log('Large file updated in GridFS and reference updated.');
        }
        console.log('File updated successfully.');
        // res.status(200).json(file);
        return true;
    } catch (error) {
        console.log(error.message)
        // res.status(500).send(error.message);
        return false;
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