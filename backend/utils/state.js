let clients = new Map();
let sessionFileTree;
let yjsCache;
let ydoc = null;
let sessionId = 0
let init = false

const globalState = {
    sessionId,
    sessionFileTree,
    clients,
    yjsCache,
    filePathToIdMap: new Map(),
    ydoc,
    init,
    watcher: null
};

module.exports = globalState;
