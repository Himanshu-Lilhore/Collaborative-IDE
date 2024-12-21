let clients = new Map();
let sessionFileTree;
let yjsCache;

const globalState = {
    sessionFileTree,
    clients,
    yjsCache
};

module.exports = globalState;
