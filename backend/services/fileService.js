const fsp = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const baseDir = path.join(__dirname, '../user');
const globalState = require('../utils/state');
const { readFile } = require('../controllers/explorerController');
const Session = require('../models/sessionModel');
const chokidar = require('chokidar');
const { ptyProcess } = require('../server/terminal');
const { initializeChokidar } = require('./sessionTree');

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
    const tree = [];
    await buildTree(directory, tree);
    return tree;
};


function getPathById(tree, targetId, path) {
    if (!tree) return null;

    if (tree && tree.length > 0) {
        for (let child of tree) {
            // console.log("targetId: ", targetId, "path: ", path)////////////////////////
            if (child.children === null) {
                if(child.id.toString() === targetId) {
                    // console.log('match found')////////////////////////
                    return `${path}/${child.name}`
                }
            } else {
                const result = getPathById(child.children, targetId, `${path}/${child.name}`);
                if (result) {
                    return result;
                }
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


const fetchFilesLocally = async (tree, basePath) => {
    try {
        for (const node of tree) {
            const filePath = path.join(basePath, node.name);

            if (node.children && node.children.length > 0) {
                if (!fs.existsSync(filePath)) {
                    const fullPath = path.join(baseDir.split(path.sep).slice(0, -1).join(path.sep), filePath)
                    fs.mkdirSync(fullPath, { recursive: true });
                }
                await fetchFilesLocally(node.children, filePath);
            } else {
                const file = await readFile(node);
                saveFileLocally(file, filePath);
            }
        }
    } catch (error) {
        console.error('Error fetching files locally:', error.message);
    }
};



const clearAndRecreateDirectory = async () => {
    const baseDir = 'C:\\aaUserFiles\\edu\\Projects\\Collaborative-IDE\\backend\\user'///////////
    console.log('Clearing and recreating directory:', baseDir);
    if (globalState.watcher) await globalState.watcher.close()
    ptyProcess.write('cd ..\r');

    try {
        if (fs.existsSync(baseDir)) {
            fs.rmSync(baseDir, { recursive: true, force: true });
        }
        fs.mkdirSync(baseDir, { recursive: true });
    } catch (error) {
        console.error('Error clearing and recreating directory:', error.message);
        throw error;
    }

    initializeChokidar('./user');
    ptyProcess.write(`cd ${baseDir}\r`);
};


// Function to save file locally after fetching it from DB
const saveFileLocally = (file, filePath) => {
    try {
        ensureDirectoryExists(baseDir);
        const fullPath = path.join(baseDir.split(path.sep).slice(0, -1).join(path.sep), filePath)
        fs.writeFileSync(fullPath, file.data, 'utf-8');
        console.log(`File saved locally: ${fullPath}`);
    } catch (error) {
        console.error('Error saving file locally:', error.message);
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
    // console.log('reading file locally')////////////////////////
    try {
        const temp = getPathById(globalState.sessionFileTree, node.id.toString(), '');
        if (temp === null) {
            // console.log('File not found in local tree (readFileLocally) | temp : ', temp)/////////
            return undefined;
        }
        const filePath = path.join(baseDir, temp);
        const content = fs.readFileSync(filePath, 'utf-8');
        // console.log(`File read from: ${filePath}`);/////////////////////
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

const updateFileLocally = (filePath, newContent) => {
    try {
        // const filePath = path.join(baseDir, fileName);
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
    fetchFilesLocally,
    generateFileTree,
    createFileLocally,
    createFolderLocally,
    readFileLocally,
    deleteFileLocally,
    deleteFolderLocally,
    updateFileLocally,
    renameFolderLocally,
    clearAndRecreateDirectory
};

