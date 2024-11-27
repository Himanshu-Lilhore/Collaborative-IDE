const Y = require('yjs');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');
const { saveYjsState, loadYjsState } = require('../services/yjsService');
const { ptyProcess } = require('../server/terminal');
const fileTreeService = require('../services/fileService');
const globalState = require('../utils/state');


const setupSocket = (io) => {
    const ydoc = new Y.Doc();
    loadYjsState(ydoc);

    io.on('connection', async (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        ptyProcess.write('cls\r');

        socket.emit('files', globalState.fileTree);

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

        socket.on('terminal', (data) => {
            ptyProcess.write(data);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};

module.exports = setupSocket;