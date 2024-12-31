const chokidar = require('chokidar');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const globalState = require('../utils/state');
const { simplifyPath } = require('../utils/utilFunctions');
const Session = require('../models/sessionModel');


const findNodeByPath = (currentTree, targetPath, basePath) => {
    if (!currentTree) return null;

    if (path.resolve(basePath) === path.resolve(targetPath)) {
        console.log('Target is root node.');
        return { id: 'root', name: 'root', children: currentTree }; // returning like this since root doesn't follow same node structure
    }

    const relativePath = path.relative(basePath, targetPath).split(path.sep);
    let currentNode = currentTree;

    for (const segment of relativePath) {
        if (!currentNode || !Array.isArray(currentNode.children)) return null;

        currentNode = currentNode.children.find(node => node.name === segment) || null;

        if (!currentNode) return null;
    }

    return currentNode;
};


// Adding files/directories
const addToSessionTree = (filePath, basePath, isDirectory) => {

    let id = ''
    if (!isDirectory) {
        const simplePath = simplifyPath(filePath);
        id = globalState.filePathToIdMap.get(simplePath);
        globalState.filePathToIdMap.delete(simplePath);
    }
    else id = uuidv4();

    // console.log('handling addToSessionTree : \n', filePath, basePath, isDirectory, id)/////////////////////////
    const parentPath = path.dirname(filePath);
    const parentNode = findNodeByPath(globalState.sessionFileTree, parentPath, basePath);

    if (parentNode && parentNode.children) {
        parentNode.children.push({
            name: path.basename(filePath),
            id: id,
            isSaved: false,
            children: isDirectory ? [] : null,
        });
    }
};

// Remove files/directories
const handleRemove = (filePath, basePath) => {
    const parentPath = path.dirname(filePath);
    const parentNode = findNodeByPath(globalState.sessionFileTree, parentPath, basePath);

    if (parentNode && parentNode.children) {
        parentNode.children = parentNode.children.filter(node => node.name !== path.basename(filePath));
    }
};

// Handle renaming of files/directories
const handleRename = (oldPath, newPath, basePath) => {
    const parentPath = path.dirname(oldPath);
    const parentNode = findNodeByPath(globalState.sessionFileTree, parentPath, basePath);

    if (parentNode && parentNode.children) {
        const node = parentNode.children.find(child => child.name === path.basename(oldPath));
        if (node) {
            node.name = path.basename(newPath);
        }
    }
};

// Handle file content changes
const handleChange = (filePath, basePath) => {
    const node = findNodeByPath(globalState.sessionFileTree, filePath, basePath);
    if (node) {
        node.isSaved = false; // Mark file as unsaved
    }
};

// Initialize chokidar to watch the directory
const initializeChokidar = (watchPath, io) => {
    globalState.watcher = chokidar.watch(watchPath, { ignoreInitial: true })
        .on('add', filePath => {
            if (!globalState.init) {
                addToSessionTree(filePath, watchPath, false);
                Session.findByIdAndUpdate(globalState.sessionId, { sessionFileTree: globalState.sessionFileTree })
            }
            io.emit('filetree', globalState.sessionFileTree);
        })
        .on('addDir', dirPath => {
            if (!globalState.init) {
                addToSessionTree(dirPath, watchPath, true);
                Session.findByIdAndUpdate(globalState.sessionId, { sessionFileTree: globalState.sessionFileTree })
            }
            io.emit('filetree', globalState.sessionFileTree);
        })
        .on('unlink', filePath => {
            if (!globalState.init) {
                handleRemove(filePath, watchPath);
                Session.findByIdAndUpdate(globalState.sessionId, { sessionFileTree: globalState.sessionFileTree })
            }
            io.emit('filetree', globalState.sessionFileTree);
        })
        .on('unlinkDir', dirPath => {
            if (!globalState.init) {
                handleRemove(dirPath, watchPath);
                Session.findByIdAndUpdate(globalState.sessionId, { sessionFileTree: globalState.sessionFileTree })
            }
            io.emit('filetree', globalState.sessionFileTree);
        })
        .on('change', filePath => {
            if (!globalState.init) {
                handleChange(filePath, watchPath);
                Session.findByIdAndUpdate(globalState.sessionId, { sessionFileTree: globalState.sessionFileTree })
            }
            io.emit('filetree', globalState.sessionFileTree);
        })
        .on('error', error => {
            console.error(`Watcher error: ${error.message}`);
        });
};



module.exports = { initializeChokidar, addToSessionTree, handleChange, handleRemove, findNodeByPath };
