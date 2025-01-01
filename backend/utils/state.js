const globalState = {
    sessionId : 0,
    sessionFileTree : undefined,
    clients : new Map(),
    yjsCache : undefined,
    filePathToIdMap: new Map(),
    ydoc : null,
    init : false,
    watcher: null,
    io : null
};

module.exports = globalState;
