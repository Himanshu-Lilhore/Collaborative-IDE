import {Terminal as XTerminal} from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useRef } from 'react';

export default function Terminal() {
    const terminalRef = useRef<any>();

    useEffect(() => {
        const term = new XTerminal({
            rows:20,
        });

        term.open(terminalRef.current);
        term.onData((data) => {
            console.log(data);
        })
    }, [])

    return (
        <div ref={terminalRef}></div>
    );
}