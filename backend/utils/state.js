let clients = new Map();
let currProject;
let yjsCache;
let ydoc;

const globalState = {
    currProject,
    clients,
    yjsCache,
    ydoc
};

module.exports = globalState;
