require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const PORT = process.env.PORT || 3000;

let globalCode = '';

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT'],
    credentials: true
}));

const server = http.createServer(app);

const io = socketIo(server, {
    connectionStateRecovery : {},
    cors : {
        origin : process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT'],
        credentials : true
    }
})

io.on('connection', (socket:any) => {
    console.log(`socket connected : ${socket.id}`)
    socket.emit('connection', socket.id, globalCode);

    socket.on('update', (code: string) => {
        globalCode = code;
        io.emit('update', code, socket.id);
    })
});



server.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`));