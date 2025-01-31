require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('../config/mongodb');
const apiRoutes = require('../routes/apiRoutes');
const setupSocket = require('../controllers/socketController');
const { expressCors, socketCorsOptions } = require('../middlewares/corsConfig');
const globalState = require('../utils/state');
const { generateFileTree } = require('../services/fileService')
const cookieParser = require('cookie-parser')
const {initializeChokidar} = require('../services/sessionTree')
const { defaultFiletree } = require('../utils/constants')
const {deleteAllFiles} = require('../utils/utilFunctions')
// const { LRUCache } = require('../services/LRUCache')

const app = express();
const server = http.createServer(app);
const io = socketIo(server, socketCorsOptions);
globalState.io = io;

// Connect to DB
connectDB();

// Middlewares
app.use(cookieParser())
app.use(expressCors)
app.use(express.json());

// Socket setup
setupSocket(io);

// init
(async () => {
    try {
        // globalState.sessionFileTree = await generateFileTree()
        globalState.sessionFileTree = defaultFiletree
        console.log('Project loaded:', globalState.sessionFileTree);
    } catch (error) {
        console.error('Error initializing file tree:', error);
    }
})();

// file tree
initializeChokidar('./user');

// (async () => {
//     await deleteAllFiles()
// })()

// Routes
app.use('/api', apiRoutes);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));