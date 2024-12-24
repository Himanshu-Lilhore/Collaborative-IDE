const Y = require('yjs');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');
// const { saveYjsState, loadYjsState } = require('../services/yjsService');
const { ptyProcess } = require('../server/terminal');
const globalState = require('../utils/state');
const { readFileLocally } = require('../services/fileService')

const setupSocket = (io) => {
    const ydoc = new Y.Doc();
    let docMap = ydoc.getMap('documents')
    // loadYjsState(ydoc);

    ptyProcess.onData((data) => {
        io.emit('terminal', data)
    })

    io.on('connection', async (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.emit('filetree', globalState.sessionFileTree);

        const update = encodeStateAsUpdate(ydoc);
        socket.emit('initialState', socket.id, update);

        socket.on('update', (clientUpdate) => {
            try {
                const updateArray = new Uint8Array(clientUpdate);
                applyUpdate(ydoc, updateArray);
                // socket.broadcast.emit('update', clientUpdate);
            } catch (err) {
                console.error('Error applying update:', err);
            }
        });

        socket.on('filecachecheck', async (node, callback) => {
            // let file = globalState.yjsCache.get(fileId);
            let file = docMap.get(node.id);
            if (!file) {
                // file = await getFile(fileId); // Loading file from DB
                data = await readFileLocally(node)
                // console.log(`Loading file ${node.id} from local to YJS : ${data}`);
                let docMap = ydoc.getMap('documents')
                let ytext = new Y.Text();
                ytext.insert(0, data)
                docMap.set(node.id, ytext);
                // await globalState.yjsCache.put(fileId);
                callback({ newDoc: Y.encodeStateAsUpdate(ydoc), fileWasInCache: false })
            } else {
                console.log('file was already in cache')
                callback({ fileWasInCache: true })
            }
        });


        socket.on('filetree', (data) => {
            socket.emit('filetree', globalState.sessionFileTree);
        });

        socket.on('terminalinit', (data) => {
            ptyProcess.write('cls\r');
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