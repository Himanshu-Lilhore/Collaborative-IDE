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
    const tree = [];
    await buildTree(directory, tree);
    return tree;
};


function getPathById(tree, targetId, path) {
    if (!tree || tree.length === 0) return null;

    if (tree && tree.length > 0) {
        for (let child of tree) {
            if (child.id.toString() === targetId) {
                return `${path}/${child.name}`
            } else {
                const result = getPathById(child.children, targetId, `${path}/${tree.name}`);
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
                // If it has children, it's a directory, so we create it locally
                if (!fs.existsSync(filePath)) {
                    const fullPath = path.join(baseDir.split(path.sep).slice(0, -1).join(path.sep), filePath)
                    fs.mkdirSync(fullPath, { recursive: true });
                }
                // Recursively fetch files for subdirectories
                await fetchFilesLocally(node.children, filePath);
            } else {
                // If it's a file, fetch it from DB and save it locally
                const file = await readFile(node);
                saveFileLocally(file, filePath);
            }
        }
    } catch (error) {
        console.error('Error fetching files locally:', error.message);
    }
};


// const clearAndRecreateDirectory = () => {
//     const baseDir = 'C:\\Users\\user\\deletiontesttttt\\real'///////////
//     // const watchPath = baseDir/////////////
//     // chokidar.watch(watchPath, { ignoreInitial: true })
//     //     .on('add', filePath => {
//     //         console.log(filePath)///////////////
//     //     })
//     chokidar.unwatch(baseDir);


//     console.log('Clearing and recreating directory:', baseDir);

//     try {
//         if (fs.existsSync(baseDir)) {
//             // Remove the directory and its contents
//             fs.rmSync(baseDir, { recursive: true, force: true });
//         }
//         // Recreate the directory
//         fs.mkdirSync(baseDir, { recursive: true });
//     } catch (error) {
//         console.error('Error clearing and recreating directory:', error.message);
//         throw error; // Rethrow to handle it in fetchFilesLocally
//     }
// };

const clearAndRecreateDirectory = async () => {
    const baseDir = 'C:\\aaUserFiles\\edu\\Projects\\Collaborative-IDE\\backend\\user'///////////
    console.log('Clearing and recreating directory:', baseDir);
    ptyProcess.write('cd ..\r');

    try {
        // Stop watchers or processes accessing baseDir if necessary
        if (globalState.watcher) await globalState.watcher.close()

        if (fs.existsSync(baseDir)) {
            // Retry mechanism for deletion
            fs.rmSync(baseDir, { recursive: true, force: true });
        }
        // Recreate the directory
        fs.mkdirSync(baseDir, { recursive: true });
    } catch (error) {
        console.error('Error clearing and recreating directory:', error.message);
        throw error;
    }

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
    try {
        const temp = getPathById(globalState.sessionFileTree, node.id, '');
        if (temp === null) {
            console.log('File not found in local tree (readFileLocally)')
            return 'File not found (readFileLocally)';
        }
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

