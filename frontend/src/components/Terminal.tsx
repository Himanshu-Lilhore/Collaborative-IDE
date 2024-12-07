import { Terminal as XTerminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef } from 'react';
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function Terminal() {
    const terminalRef = useRef<any>();
    const term = useRef<any>(new XTerminal({
        rows: 13,
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
        <div className='flex flex-row relative'>
            <div className='bg-orange-500 z-10 font-mono font-bold pb-1 rotate-180 text-end' style={{textOrientation:'mixed', writingMode:'vertical-lr'}}>terminal_</div>
            <div className='h-full p-1 bg-black'></div>
            <div ref={terminalRef} className='w-full'/>
        </div>
    );
}