require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Y = require('yjs');
const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path')
var os = require('os');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');
const PORT = process.env.PORT || 3000;
const pty = require('node-pty')
const connectDB = require('../config/mongodb')
const chokidar = require('chokidar');
const { v4: uuidv4 } = require('uuid');

connectDB();
let fileTree = generateFileTree('./user');

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 10,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env
});


ptyProcess.onData((data: any) => {
    io.emit('terminal', data)
})


app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
}));


const server = http.createServer(app);


const io = socketIo(server, {
    connectionStateRecovery: {},
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT'],
        credentials: true
    }
});


const ydoc = new Y.Doc();


async function saveYjsState() {
    const update = encodeStateAsUpdate(ydoc);
    await fsPromises.writeFile('doc-state.bin', update);
    console.log('Yjs update saved to file.');
}


function loadYjsState() {
    if (fs.existsSync('doc-state.bin')) {
        const savedState = fs.readFileSync('doc-state.bin');
        applyUpdate(ydoc, savedState);
        console.log('Yjs state loaded from file');
    }
}
loadYjsState();  // Load any saved state when the server starts


let clients = new Map();


io.on('connection', async (socket: any) => {
    console.log(`Socket connected: ${socket.id}`);
    ptyProcess.write('cls\r');
    socket.emit('files', await fileTree)

    // On new connection, send the current Yjs state to the client
    const update = encodeStateAsUpdate(ydoc);
    console.log('Sending initial state (length):', update.length);
    socket.emit('initialState', socket.id, update);

    // Initializing default doc
    const ytext = ydoc.getText('default');
    ytext.delete(0, ytext.length);
    ytext.insert(0, '// open a file to start working');

    socket.on('update', (clientUpdate: any) => {
        try {
            const updateArray = new Uint8Array(clientUpdate);
            applyUpdate(ydoc, updateArray);
            console.log(`Applied update from ${socket.id}`);

            // Broadcast the update to all other connected clients
            // socket.broadcast.emit('update', clientUpdate);
        } catch (error) {
            console.error('Error applying update:', error);
        }
    });

    socket.on('terminal', (data: any) => {
        // console.log('Term', data)
        ptyProcess.write(data);
    })

    clients.set(socket.id, {});

    // When a client sends awareness update data, broadcast to others
    socket.on('awarenessUpdate', (data: any) => {
        console.log('Received awareness update:', data);

        // Relay this awareness data to all connected clients (except the sender)
        socket.broadcast.emit('awarenessUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('disconnection received');
        io.emit('disconnected');
    })

    socket.on('filechange', (id: string) => {
        console.log('Changed file to:', id);
    });
    // socket.on('files', async () => {
    //     fileTree = await generateFileTree('./user');
    //     console.log("Emitting file tree ...")
    //     io.emit('files', fileTree )
    // })
});


// app.get('/files', async (req:any, res:any) => {
//     const fileTree = await generateFileTree('../user');
//     return res.json({ tree: fileTree })
// })


chokidar.watch('./user').on('all', (event: any, path: any) => {
    io.emit('file:refresh', path)
});


async function buildTree(currentDir: any, currentTree: any) {
    const items = await fsPromises.readdir(currentDir)

    for (const item of items) {
        let tempObj: any = { name: item, id: uuidv4() };
        const itemPath = path.join(currentDir, item)
        const stat = await fsPromises.stat(itemPath)

        if (stat.isDirectory()) {
            tempObj.children = []
            await buildTree(itemPath, tempObj.children)
        } else {
            tempObj.children = null
        }
        currentTree.push(tempObj);
    }
}


async function generateFileTree(directory: any) {
    const tree: any = { name: 'root', id: 'root', children: [] }

    await buildTree(directory, tree.children);
    return tree
}


// Periodically save the Yjs state to ensure changes are persisted
// setInterval(() => {
//     saveYjsState();
// }, 5000);  // Save every few minutes

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
