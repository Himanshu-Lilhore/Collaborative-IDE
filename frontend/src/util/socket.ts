// socket.js
import { io } from "socket.io-client";

let socket:any;

const getSocket = () => {
    if (!socket) {
        socket = io(import.meta.env.VITE_BACKEND_URL);
    }
    return socket;
};

export default getSocket;
