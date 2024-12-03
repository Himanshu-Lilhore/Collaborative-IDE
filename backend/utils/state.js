let clients = new Map();
let currProject;
let yjsCache;

const globalState = {
    currProject,
    clients,
    yjsCache
};

module.exports = globalState;
