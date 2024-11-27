const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

module.exports = { generateFileTree };
