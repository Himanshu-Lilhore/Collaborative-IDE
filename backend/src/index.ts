require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Y = require('yjs');
const fs = require('fs/promises');
const path = require('path')
var os = require('os');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');
const PORT = process.env.PORT || 3000;
const pty = require('node-pty')
const connectDB = require('../config/mongodb')
const chokidar = require('chokidar');

connectDB();

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 10,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env
});

ptyProcess.onData((data: any) => {
    // console.log("Data : ", data)
    io.emit('terminal', data)
})

app.use(express.json());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
}));

// Create an HTTP server
const server = http.createServer(app);

// Attach socket.io to the same server instance
const io = socketIo(server, {
    connectionStateRecovery: {},
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT'],
        credentials: true
    }
});

// Create the Yjs document
const ydoc = new Y.Doc();
const ytext = ydoc.getText('code');

// Function to save only the actual update
function saveYjsState() {
    // Encode the Yjs document's state as an update
    const update = encodeStateAsUpdate(ydoc);

    // Save the update (could be to a file or a database)
    fs.writeFileSync('doc-state.bin', update);

    // Optionally log the change to the console
    console.log('Yjs update saved to file.');
}

// Set up an observer to track changes in the Yjs document
ytext.observe((event: any) => {
    console.log('Document change detected:');

    event.changes.keys.forEach((change: any, key: any) => {
        console.log(`Key: ${key}, Change: ${JSON.stringify(change)}`);
    });

    saveYjsState();
});

// Load Yjs state from file (optional: to persist between server restarts)
function loadYjsState() {
    if (fs.existsSync('doc-state.bin')) {
        const savedState = fs.readFileSync('doc-state.bin');
        applyUpdate(ydoc, savedState);  // Apply the saved state to the Yjs document
        console.log('Yjs state loaded from file');
    }
}

// loadYjsState();  // Load any saved state when the server starts
let clients = new Map();

io.on('connection', async (socket: any) => {
    console.log(`Socket connected: ${socket.id}`);
    ptyProcess.write('cls\r');
    let fileTree = await generateFileTree('./user');
    socket.emit('files', fileTree )

    // On new connection, send the current Yjs state to the client
    const update = encodeStateAsUpdate(ydoc);
    console.log('Sending initial state (length):', update.length);
    socket.emit('initialState', socket.id, update);

    socket.on('update', (clientUpdate: any) => {
        try {
            const updateArray = new Uint8Array(clientUpdate); // Convert received data back to Uint8Array
            applyUpdate(ydoc, updateArray); // Apply update to the backend Yjs document
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

    socket.on('files', async () => {
        fileTree = await generateFileTree('./user');
        console.log("Emitting file tree ...")
        io.emit('files', fileTree )
    })
});


// app.get('/files', async (req:any, res:any) => {
//     const fileTree = await generateFileTree('../user');
//     return res.json({ tree: fileTree })
// })




chokidar.watch('./user').on('all', (event:any, path:any) => {
    io.emit('file:refresh', path)
});


async function generateFileTree(directory:any) {
    const tree:any = {}

    async function buildTree(currentDir:any, currentTree:any) {
        const items = await fs.readdir(currentDir)

        for (const item of items) {
            const itemPath = path.join(currentDir, item)
            const stat = await fs.stat(itemPath)

            if (stat.isDirectory()) {
                currentTree[item] = {}
                await buildTree(itemPath, currentTree[item])
            } else {
                currentTree[item] = null
            }
        }
    }

    await buildTree(directory, tree);
    return tree
}

// Periodically save the Yjs state to ensure changes are persisted
// setInterval(() => {
//     saveYjsState();
// }, 2000);  // Save every few minutes

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
