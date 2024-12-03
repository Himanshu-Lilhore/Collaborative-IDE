const Y = require('yjs');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');
const { saveYjsState, loadYjsState } = require('../services/yjsService');
const { ptyProcess } = require('../server/terminal');
const globalState = require('../utils/state');
const { getFile } = require('../services/fileService')

const setupSocket = (io) => {
    const ydoc = new Y.Doc();
    loadYjsState(ydoc);

    ptyProcess.onData((data) => {
        io.emit('terminal', data)
    })

    io.on('connection', async (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        ptyProcess.write('cls\r');

        socket.emit('filetree', globalState.currProject?.fileTree);

        const update = encodeStateAsUpdate(ydoc);
        socket.emit('initialState', socket.id, update);

        socket.on('update', (clientUpdate) => {
            try {
                const updateArray = new Uint8Array(clientUpdate);
                applyUpdate(ydoc, updateArray);
                socket.broadcast.emit('update', clientUpdate);
            } catch (err) {
                console.error('Error applying update:', err);
            }
        });

        socket.on('filecachecheck', async (fileId) => {
            let file = globalState.yjsCache.get(fileId);
            if (!file) {
                console.log(`Loading file ${fileId} from DB...`);
                file = await getFile(fileId); // Loading file from DB
                console.log(file.name, file.data)
                let ytext = ydoc.getText(fileId)
                ytext.insert(0, file.data)
                globalState.yjsCache.put(fileId);
                io.emit('refresh', encodeStateAsUpdate(ydoc));
            }
            console.log("cache : ", globalState.yjsCache);
        });

        socket.on('terminal', (data) => {
            ptyProcess.write(data);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};

module.exports = setupSocket;