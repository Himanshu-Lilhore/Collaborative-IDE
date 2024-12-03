require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('../config/mongodb');
const apiRoutes = require('../routes/apiRoutes');
const setupSocket = require('../controllers/socketController');
const { expressCors } = require('../middlewares/corsConfig');
const { socketCorsOptions } = require('../middlewares/corsConfig');
const globalState = require('../utils/state');
const { generateFileTree } = require('../services/fileService')
const { ptyProcess } = require('../server/terminal')
const Project = require('../models/projectModel');
const { LRUCache } = require('../services/LRUCache')
const Y = require('yjs');


const app = express();
const server = http.createServer(app);
const io = socketIo(server, socketCorsOptions);

// Connect to DB
connectDB();

// Middlewares
app.use(expressCors)
app.use(express.json());

// Socket setup
setupSocket(io);

// init
(async () => {
    try {
        // globalState.ydoc = new Y.Doc();
        globalState.yjsCache = new LRUCache(10);
        globalState.currProject = await Project.findById('674e34865df7c7f91602ea41');
        console.log('Project loaded:', globalState.currProject.fileTree);
    } catch (error) {
        console.error('Error initializing file tree:', error);
    }
})();

// Routes
app.use('/api', apiRoutes);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));