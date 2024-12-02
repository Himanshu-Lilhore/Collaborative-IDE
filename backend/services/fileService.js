const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { GridFSBucket } = require('mongodb');
const File = require('../models/fileModel');
const mongoose = require('mongoose');
const Readable = require('stream').Readable;



const buildTree = async (currentDir, currentTree) => {
    const items = await fs.readdir(currentDir);
    for (const item of items) {
        const tempObj = { name: item, id: uuidv4() };
        const itemPath = path.join(currentDir, item);
        const stat = await fs.stat(itemPath);

        if (stat.isDirectory()) {
            tempObj.children = [];
            await buildTree(itemPath, tempObj.children);
        } else {
            tempObj.children = null;
        }
        currentTree.push(tempObj);
    }
};

const generateFileTree = async (directory) => {
    const tree = { name: 'root', id: 'root', children: [] };
    await buildTree(directory, tree.children);
    return tree;
};




async function createFile(fileName, fileContent, userId) {
    const fileSizeInMB = Buffer.byteLength(fileContent, 'utf-8') / (1024 * 1024);
    let file;

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

    return file;
}

async function getFile(fileId) {
    let file = await File.findById(fileId);
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
        
        return file
    }

    throw new Error('File data not found');
}



async function updateFile(fileId, newFileName, newFileContent, userId) {
    const file = await File.findById(fileId);
    if (!file) throw new Error('File not found');

    const fileSizeInMB = Buffer.byteLength(newFileContent, 'utf-8') / (1024 * 1024);

    file.name = newFileName || file.name;
    file.lastUpdatedBy = userId;

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

    return file;
}


async function deleteFile(fileId) {
    const file = await File.findById(fileId);
    if (!file) throw new Error('File not found');

    if (file.data && file.data.startsWith('gridfs.')) {
        const gridFsId = file.data.split('.')[1];
        const bucket = new GridFSBucket(mongoose.connection.getClient().db());
        await bucket.delete(new mongoose.Types.ObjectId(gridFsId));
        console.log('File deleted from GridFS.');
    }

    await File.deleteOne({_id:fileId});
    console.log('File deleted from MongoDB.');
}


module.exports = { generateFileTree, createFile, getFile, updateFile, deleteFile };

