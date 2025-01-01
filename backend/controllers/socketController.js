const Y = require('yjs');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');
// const { saveYjsState, loadYjsState } = require('../services/yjsService');
const { ptyProcess } = require('../server/terminal');
const globalState = require('../utils/state');
const { readFileLocally, updateFileLocally } = require('../services/fileService')
const { createFile, createFolder } = require('./explorerController')
const Session = require('../models/sessionModel');
const { findNodeById } = require('../services/sessionTree');

const setupSocket = (io) => {
    globalState.ydoc = new Y.Doc();
    let docMap = globalState.ydoc.getMap('documents')
    // loadYjsState(globalState.ydoc);

    ptyProcess.onData((data) => {
        io.emit('terminal', data)
    })

    io.on('connection', async (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.emit('filetree', globalState.sessionFileTree);
        
        socket.on('initialState', () => {
            const update = encodeStateAsUpdate(globalState.ydoc);
            socket.emit('initialState', { id: socket.id, initialState: update })
        });


        socket.on('update', (clientUpdate) => {
            try {
                const updateArray = new Uint8Array(clientUpdate);
                applyUpdate(globalState.ydoc, updateArray);
                socket.broadcast.emit('update', clientUpdate);
            } catch (err) {
                console.error('Error applying update:', err);
            }
        });

        socket.on('update:ytext', (id, newContent) => {
            try {
                const result = findNodeById(globalState.sessionFileTree, id)
                console.log('result : ', result)////////////////////////
                updateFileLocally(result.path, newContent);
                result.node.isSaved = false;
                // console.log('updated filetree : ', globalState.sessionFileTree)////////////
            } catch (err) {
                console.error('Error updating doc locally :', err);
            }
        });

        socket.on('filecachecheck', async (node, callback) => {
            // let file = globalState.yjsCache.get(fileId);
            console.log('filecachecheck')////////////////////////
            let file = docMap.get(node.id);
            if (!file) {
                data = await readFileLocally(node)
                let docMap = globalState.ydoc.getMap('documents')
                let ytext = new Y.Text();
                ytext.insert(0, data)
                docMap.set(node.id, ytext);
                // await globalState.yjsCache.put(fileId);
                callback({ newDoc: Y.encodeStateAsUpdate(globalState.ydoc), fileWasInCache: false })
            } else {
                console.log('file was already in cache')
                callback({ fileWasInCache: true })
            }
        });


        // filetree events
        socket.on('filetree', (data) => {
            socket.emit('filetree', globalState.sessionFileTree);
        });
        socket.on('addFile', async (data) => {
            const { filePath, userId } = data;
            try {
                await createFile(filePath, userId);
            } catch (error) {
                console.error(`Error adding file: ${error.message}`);
                socket.emit('error', { message: 'Failed to add file.' });
            }
        });
        socket.on('removeFile', (data) => {
            const { filePath } = data;
            handleRemove(filePath, '/user');
        });
        socket.on('addFolder', async (data) => {
            const { folderPath } = data;
            try {
                await createFolder(folderPath);
            } catch (error) {
                console.error(`Error adding file: ${error.message}`);
                socket.emit('error', { message: 'Failed to add file.' });
            }
        });


        // terminal events
        socket.on('terminalinit', (data) => {
            ptyProcess.write('cls\r');
        });
        socket.on('terminal', (data) => {
            ptyProcess.write(data);
        });


        socket.on('disconnect', async () => {
            console.log('Socket disconnected:', socket.id);
            if(globalState.sessionId) await Session.findByIdAndUpdate(globalState.sessionId, { sessionFileTree: globalState.sessionFileTree })
        });
    });
};

module.exports = setupSocket;