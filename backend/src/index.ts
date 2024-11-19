require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const Y = require('yjs');
const fs = require('fs');
const { encodeStateAsUpdate, applyUpdate } = require('yjs');

const PORT = process.env.PORT || 3000;

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
ytext.observe((event:any) => {
    console.log('Document change detected:');

    event.changes.keys.forEach((change:any, key:any) => {
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

io.on('connection', (socket:any) => {
    console.log(`Socket connected: ${socket.id}`);

    // On new connection, send the current Yjs state to the client
    const update = encodeStateAsUpdate(ydoc);
    console.log('Sending initial state (length):', update.length);
    socket.emit('initialState', socket.id, update);

    socket.on('update', (clientUpdate:any) => {
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


    clients.set(socket.id, {});

    // When a client sends awareness update data, broadcast to others
    socket.on('awarenessUpdate', (data:any) => {
        console.log('Received awareness update:', data);

        // Relay this awareness data to all connected clients (except the sender)
        socket.broadcast.emit('awarenessUpdate', data);
    });
});


// Periodically save the Yjs state to ensure changes are persisted
// setInterval(() => {
//     saveYjsState();
// }, 2000);  // Save every few minutes

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
