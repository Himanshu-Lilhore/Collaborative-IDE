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

    // Event provides details on the changes (insertions, deletions, etc.)
    event.changes.forEach((change:any) => {
        if (change.insert) {
            console.log('Inserted:', change.insert);
        }
        if (change.delete) {
            console.log('Deleted:', change.delete);
        }
    });

    // Save the Yjs update after every change
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

loadYjsState();  // Load any saved state when the server starts

// Handle socket connections
io.on('connection', (socket:any) => {
    console.log(`socket connected: ${socket.id}`);

    // On new connection, send the current Yjs state to the client
    const update = encodeStateAsUpdate(ydoc); // Get the Yjs state as an update
    console.log('Sending initial state:', update); 
    socket.emit('connection', socket.id, Array.from(update));

    // socket.on('update', (code:any) => {
    //     // Apply the received update to the Yjs document (you would serialize and send the updates)
    //     const ytext = ydoc.getText('code');
    //     ytext.delete(0, ytext.length);  // Clear existing content
    //     ytext.insert(0, code);  // Insert the new code

    //     // Save Yjs state periodically or on every update
    //     // saveYjsState();  // Save the state to a file (or database)
        
    //     // Broadcast the update to other clients
    //     io.emit('update', code, socket.id);
    // });
});

// Periodically save the Yjs state to ensure changes are persisted
setInterval(() => {
    saveYjsState();
}, 25000);  // Save every few minutes

// Start the server
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
