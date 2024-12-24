const chokidar = require('chokidar');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const globalState = require('../utils/state');

// Utility function to find a node by its path
const findNodeByPath = (currentTree, targetPath, basePath) => {
    console.log('Finding node: \n', currentTree, targetPath, basePath);
    if (!currentTree || !currentTree.children) return null;

    // Handle case where targetPath is the root (basePath)
    if (path.resolve(basePath) === path.resolve(targetPath)) {
        console.log('Target is root node.');
        return currentTree; // Return the root node
    }

    const relativePath = path.relative(basePath, targetPath).split(path.sep);
    let currentNode = currentTree;

    for (const segment of relativePath) {
        if (!currentNode || !currentNode.children) return null;
        currentNode = currentNode.children.find(node => node.name === segment) || null;
    }

    console.log('Found node:', currentNode);
    return currentNode;
};


// Handle addition of files/directories
const handleAdd = (filePath, basePath, isDirectory) => {
    console.log('handling add file : \n', filePath, basePath, isDirectory)/////////////////////////
    const parentPath = path.dirname(filePath);
    const parentNode = findNodeByPath(globalState.sessionFileTree, parentPath, basePath);

    if (parentNode && parentNode.children) {
        parentNode.children.push({
            id: uuidv4(),
            name: path.basename(filePath),
            isSaved: true,
            children: isDirectory ? [] : null,
        });
    }
};

// Handle removal of files/directories
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
const initializeChokidar = (watchPath) => {
    chokidar.watch(watchPath, { ignoreInitial: false })
        .on('add', filePath => handleAdd(filePath, watchPath, false))
        .on('addDir', dirPath => handleAdd(dirPath, watchPath, true))
        .on('unlink', filePath => handleRemove(filePath, watchPath))
        .on('unlinkDir', dirPath => handleRemove(dirPath, watchPath))
        .on('change', filePath => handleChange(filePath, watchPath))
        .on('error', error => console.error(`Watcher error: ${error.message}`));
};

const emitter = (io) => {
    chokidar.watch('user').on('all', () => {
        io.emit('filetree', globalState.sessionFileTree);
    })
}

module.exports = { initializeChokidar, emitter };
