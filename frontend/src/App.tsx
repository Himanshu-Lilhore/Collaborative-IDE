import { useState, useEffect, useRef } from 'react';
import './App.css'
// import CodeEditor from './components/CodeEditor'
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
    // const [code, setCode] = useState('// DEFAULT CODE');
    // const timer = useRef<any>();
    // const [trigger, setTrigger] = useState<Date | string>('DEFAULT');
    // const [editor, setEditor] = useState<any>(null);
    const editorRef = useRef<any>(null)

    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;
        // Initialize YJS
        const ydoc = new Y.Doc();  // collection of shared objects

        // Connect to others with socketio
        const provider = new SocketIOProvider(
            import.meta.env.VITE_BACKEND_URL,  // Backend WebSocket server URL
            'my-room',  // The room or namespace to join for communication
            ydoc,  // The Yjs document to synchronize
            { autoConnect: true },  // Optional config to automatically connect
            {}  // Optional socket.io options (e.g., authentication)
        );

        const ytext = ydoc.getText('code');

        // Bind YJS to monaco
        const binding = new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    }

    useEffect(() => {
        socket.on("connection", (id, initialState) => {
            console.log('You are now connected as:', id);
            setUser(id);

            // Apply the initial Yjs state to the editor
            if (editorRef.current) {
                // Re-apply Yjs document update to editor, if needed
                const ydoc = new Y.Doc();
                const provider = new SocketIOProvider(import.meta.env.VITE_BACKEND_URL, 'my-room', ydoc, { autoConnect: true }, {});
                const updateArray = new Uint8Array(initialState);  // Convert array back to Uint8Array
                Y.applyUpdate(ydoc, updateArray);
            
            const ytext = ydoc.getText('code');

            // // Bind Yjs document to the Monaco editor
            const binding = new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
            }
        });
    }, [])


    // useEffect(() => {
    //     socket.on('update', (updatedCode: string, sender: string) => {
    //         if (user !== 'DEFAULT' && user !== sender) {
    //             console.log(`${user} == ${sender} ??`);
    //             console.log('received code update');
    //             setCode(updatedCode);
    //         }
    //     })
    // }, [user])


    // useEffect(() => {
    //     if(code === '// DEFAULT CODE' || trigger === 'DEFAULT') return;

    //     clearTimeout(timer.current);

    //     timer.current = setTimeout(() => {
    //         console.log('Sending code update...');
    //         socket.emit('update', code);
    //     }, 1000);
    // }, [trigger])


    useEffect(() => {
        console.log(`user id set to : ${user}`);
    }, [user])
    // useEffect(() => {
    //     console.log('Code updated.');
    // }, [code])


    return (
        <div className=''>
            <InfoPanel user={user} />
            {/* <CodeEditor code={code} setCode={setCode} setTrigger={setTrigger}/> */}
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

////////////////////////////////////////////////////////////////


// import { v4 as uuidv4 } from 'uuid';
// import { useState, useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import * as Y from 'yjs';
// import { SocketIOProvider } from 'y-socket.io';
// import CodeEditor from './components/CodeEditor';
// import { MonacoBinding } from 'y-monaco';

// const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

// const App = () => {
//     const [user, setUser] = useState<string | null>('DEFAULT');
//     const [editor, setEditor] = useState<any>(null);
//     const socketRef = useRef<Socket | null>(null);
//     const documentId = useRef<string>(uuidv4()).current; // Unique document ID per session

//     const ydoc = useRef(new Y.Doc()).current;
//     const provider = new SocketIOProvider(SOCKET_URL, documentId, ydoc, { autoConnect: true });
//     const ytext = ydoc.getText('code');

//     useEffect(() => {
//         if (!socketRef.current) {
//             const socket = io(SOCKET_URL);
//             socketRef.current = socket;

//             socket.on('connect', () => {
//                 console.log('Connected as:', socket.id);
//                 setUser(socket.id || null);
//             });

//             return () => {
//                 socket.disconnect();
//                 socketRef.current = null;
//             };
//         }
//     }, []);

//     useEffect(() => {
//         if (editor) {
//             const binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness);

//             return () => binding.destroy();
//         }
//     }, [editor, ytext, provider]);

//     return (
//         <div>
//             <h1>Collaborative Code Editor</h1>
//             <p>Connected as: {user}</p>
//             <CodeEditor setEditor={setEditor} ytext={ytext} provider={provider} />
//         </div>
//     );
// };

// export default App;

////////////////////////////////////////////

// import { useState, useEffect, useRef } from 'react';
// import { v4 as uuidv4 } from 'uuid';
// import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';
// import CodeEditor from './components/CodeEditor';
// import { MonacoBinding } from 'y-monaco';

// const WEBSOCKET_URL = 'ws://localhost:3000'; // Replace with your backend WebSocket server URL

// // Initialize Yjs document and WebSocket provider once
// const ydoc = new Y.Doc();
// const documentId = uuidv4();
// const provider = new WebsocketProvider(WEBSOCKET_URL, documentId, ydoc);
// const ytext = ydoc.getText('code'); // Shared text type for code content

// const App = () => {
//     const [user, setUser] = useState<string | null>('DEFAULT');
//     const [editor, setEditor] = useState<any>(null);

//     useEffect(() => {
//         provider.on('status', ({ status }: { status: string }) => {
//             console.log(`WebSocket connection status: ${status}`);
//         });

//         // Set a unique user state once
//         provider.awareness.setLocalStateField('user', {
//             id: uuidv4(),
//             name: `User-${Math.floor(Math.random() * 1000)}`,
//         });

//         return () => {
//             provider.disconnect(); // Disconnect provider on unmount
//         };
//     }, []);

//     useEffect(() => {
//         let binding: MonacoBinding | null = null;

//         if (editor) {
//             // Ensure binding is created only once per editor
//             binding = new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness);

//             return () => {
//                 binding?.destroy(); // Clean up binding on unmount
//                 binding = null;
//             };
//         }
//     }, [editor]);

//     return (
//         <div>
//             <h1>Collaborative Code Editor</h1>
//             <p>Connected as: {user}</p>
//             <CodeEditor setEditor={setEditor} ytext={ytext} provider={provider} />
//         </div>
//     );
// };

// export default App;
