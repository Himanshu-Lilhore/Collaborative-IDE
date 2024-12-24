const fsp = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const baseDir = path.join(__dirname, '../user');
const globalState = require('../utils/state');
const constants = require('../utils/constants');

const buildTree = async (currentDir, currentTree) => {
    const items = await fsp.readdir(currentDir);
    for (const item of items) {
        let itemPath = path.join(currentDir, item);

        let name, id
        let isDirectory

        try {
            const stat1 = await fsp.stat(itemPath);
            isDirectory = stat1.isDirectory();
        } catch (error) {
            console.warn(`File or directory not found: ${itemPath}. Skipping. Error: ${error.message}`);
            continue;
        }
        name = item
        id = uuidv4();

        // if (isDirectory) {
        //     name = item
        //     id = uuidv4();
        // } else {
        //     name = item; //item.includes(constants.idSeparator) ? item : `${item}${constants.idSeparator}${uuidv4()}${constants.idSeparator}`;
        //     id = uuidv4();
        // }
        // // Rename the item locally if necessary
        // if (item !== name) {
        //     // const newPath = path.join(currentDir, name);
        //     // await fsp.rename(itemPath, newPath); // renaming
        //     if (isDirectory) {
        //         // const oldFolderPath = path.join(currentDir, item);
        //         // const newFolderPath = path.join(currentDir, name);
        //         // fs.renameSync(oldFolderPath, newFolderPath);
        //         // itemPath = path.join(currentDir, name)
        //     } else {
        //         const oldPath = path.join(currentDir, item);
        //         const newPath = path.join(currentDir, name);
        //         fs.renameSync(oldPath, newPath);
        //     }
        // }
        // itemPath = path.join(currentDir, name)
        // const stat = await fsp.stat(itemPath);

        const tempObj = { name, id };

        if (isDirectory) {
            tempObj.children = [];
            await buildTree(itemPath, tempObj.children);
        } else {
            tempObj.children = null;
        }
        currentTree.push(tempObj);
    }
};

const generateFileTree = async () => {
    directory = path.join(__dirname, '../user');
    const tree = { name: 'root', id: 'root', children: [] };
    await buildTree(directory, tree.children);
    return tree;
};


function getPathById(tree, targetId, path) {
    if (!tree) return null;

    if (tree.id === targetId) {
        return `${path}/${tree.name}`.substring(5);  // romoved the /root part with substring
    }

    if (tree.children && tree.children.length > 0) {
        for (let child of tree.children) {
            const result = getPathById(child, targetId, `${path}/${tree.name}`);
            if (result) {
                return result;
            }
        }
    }

    return null;
}


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

const readFileLocally = async (node) => {
    try {
        const temp = getPathById(globalState.sessionFileTree, node.id, '');
        const filePath = path.join(baseDir, temp);
        const content = fs.readFileSync(filePath, 'utf-8');
        console.log(`File read from: ${filePath}`);
        return content;
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        throw error;
    }
};

const deleteFileLocally = (fileName) => {
    try {
        const filePath = path.join(baseDir, fileName);
        console.log(filePath)
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File deleted at: ${filePath}`);
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
        throw error;
    }
};

const deleteFolderLocally = (folderName) => {
    try {
        const folderPath = path.join(baseDir, folderName);
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
            console.log(`Folder deleted at: ${folderPath}`);
        } else {
            console.warn(`Folder not found: ${folderPath}`);
        }
    } catch (error) {
        console.error(`Error deleting folder: ${error.message}`);
        throw error;
    }
};

const updateFileLocally = (fileName, newContent) => {
    try {
        const filePath = path.join(baseDir, fileName);
        if (fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`File updated at: ${filePath}`);
        } else {
            console.warn(`File not found: ${filePath}`);
        }
    } catch (error) {
        console.error(`Error updating file: ${error.message}`);
        throw error;
    }
};

const renameFolderLocally = (oldFolderName, newFolderName) => {
    try {
        const oldFolderPath = path.join(baseDir, oldFolderName);
        const newFolderPath = path.join(baseDir, newFolderName);
        if (fs.existsSync(oldFolderPath)) {
            fs.renameSync(oldFolderPath, newFolderPath);
            console.log(`Folder renamed from ${oldFolderPath} to ${newFolderPath}`);
        } else {
            console.warn(`Folder not found: ${oldFolderPath}`);
        }
    } catch (error) {
        console.error(`Error renaming folder: ${error.message}`);
        throw error;
    }
};


module.exports = {
    generateFileTree,
    createFileLocally,
    createFolderLocally,
    readFileLocally,
    deleteFileLocally,
    deleteFolderLocally,
    updateFileLocally,
    renameFolderLocally
};

