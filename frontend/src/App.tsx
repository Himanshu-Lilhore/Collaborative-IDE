import { useState, useEffect, useRef } from 'react';
import './App.css'
import InfoPanel from './components/InfoPanel'
import { io } from "socket.io-client";
import Axios from 'axios';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { MonacoBinding } from 'y-monaco';
import { Editor } from "@monaco-editor/react";

Axios.defaults.withCredentials = true;
const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function App() {
    const [user, setUser] = useState<string>('DEFAULT')
    const editorRef = useRef<any>(null)
    const ydoc = useRef(new Y.Doc()).current;
    const provider = useRef(
        new SocketIOProvider(
            import.meta.env.VITE_BACKEND_URL,
            'my-room',
            ydoc,
            { autoConnect: true }
        )
    ).current;


    function handleEditorDidMount(editor: any, monaco: any) {
        monaco.editor.defineTheme('custom-theme', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                // Highlighted text background color
                'editor.selectionBackground': '#96ff30ad',
                // Caret (cursor) color
                'editorCursor.foreground': '#BFFF00',
            },
        });

        monaco.editor.setTheme('custom-theme');

        editorRef.current = editor;

        const ytext = ydoc.getText('code');

        const binding = new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    }


    useEffect(() => {
        const initialStateHandler = (id: string, initialState: Uint8Array) => {
            console.log('Connected as:', id);
            setUser(id);

            // Apply the initial state to the existing Y.Doc
            Y.applyUpdate(ydoc, new Uint8Array(initialState));
        };

        socket.on('initialState', initialStateHandler);

        provider.awareness.on('change', () => {
            const update = Y.encodeStateAsUpdate(ydoc); // Generate update
            socket.emit('update', update); // Send update to the backend
        });

        // Handle updates from the backend
        socket.on('update', (update) => {
            Y.applyUpdate(ydoc, new Uint8Array(update)); // Apply update received from the backend
        });

        // Cleanup on unmount
        return () => {
            socket.off('initialState', initialStateHandler);
        };
    }, [ydoc]);


    useEffect(() => {
        console.log(`user id set to : ${user}`);
    }, [user])


    return (
        <div className=''>
            <InfoPanel user={user} />
            <Editor
                options={{
                    minimap: {
                        enabled: false,
                    },
                }}
                height="75vh"
                theme="vs-dark"
                language='html'
                onMount={handleEditorDidMount}
            />
        </div>
    )
}