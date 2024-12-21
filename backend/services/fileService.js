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
        
        console.log(itemPath)
        let name, id
        let isDirectory
        
        console.log(1)
        try {
            const stat1 = await fsp.stat(itemPath);
            isDirectory = stat1.isDirectory();
        } catch (error) {
            console.warn(`File or directory not found: ${itemPath}. Skipping. Error: ${error.message}`);
            continue;
        }
        console.log(2)
        if (isDirectory) {
            name = item
            id = uuidv4();
        } else {
            name = item.includes(constants.idSeparator) ? item : `${item}${constants.idSeparator}${uuidv4()}`;
            id = name.split(constants.idSeparator)[1];
        }
        
        // Rename the item locally if necessary
        if (item !== name) {
            // const newPath = path.join(currentDir, name);
            // await fsp.rename(itemPath, newPath); // renaming
            if (isDirectory) {
                console.log(3)
                // const oldFolderPath = path.join(currentDir, item);
                // const newFolderPath = path.join(currentDir, name);
                // fs.renameSync(oldFolderPath, newFolderPath);
                // itemPath = path.join(currentDir, name)
            } else {
                // console.log(4)
                // const content = await fs.readFileSync(itemPath, 'utf-8');
                // console.log(5)
                // await fs.unlinkSync(itemPath);
                // console.log(6)
                // itemPath = path.join(currentDir, name)
                // console.log(7)
                // await fs.writeFileSync(itemPath, content, 'utf-8');
                // console.log(8)
                const oldPath = path.join(currentDir, item);
                const newPath = path.join(currentDir, name);
                fs.renameSync(oldPath, newPath);
            }
        }
        const tempObj = { name, id };
        console.log(9)
        // const stat = await fsp.stat(itemPath);
        
        if (isDirectory) {
            tempObj.children = [];
            console.log(10)
            await buildTree(itemPath, tempObj.children);
            console.log(11)
        } else {
            tempObj.children = null;
        }
        console.log(12)
        currentTree.push(tempObj);
        console.log(13)
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

