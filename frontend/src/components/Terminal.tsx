import { Terminal as XTerminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef } from 'react';
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function Terminal() {
    const terminalRef = useRef<any>();
    const term = useRef<any>(new XTerminal({
        rows: 10,
    })).current;

    useEffect(() => {
        term.open(terminalRef.current);
        term.onData((data: any) => {
            socket.emit('terminal', data);
        });
        socket.on('terminal', (data) => {
            term.write(data);
        });

        return () => {
            term.dispose();
        };
    }, [])

    return (
        <div ref={terminalRef} />
    );
}