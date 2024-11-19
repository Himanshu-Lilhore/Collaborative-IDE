import { useState, useEffect, useRef } from 'react';
import './App.css'
import InfoPanel from './components/InfoPanel'
import { io } from "socket.io-client";
import Axios from 'axios';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { MonacoBinding } from 'y-monaco';
import CodeEditor from './components/CodeEditor';


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
    const handleEditorDidMount = useRef<any>();
    const [currentDecorations, setCurrentDecorations] = useState<string[]>([])
    const [alreadyUpdated, setAlreadyUpdated] = useState<string[]>([])
    const decorationTimer = useRef<any>(setTimeout(() => { }, 100));

    useEffect(() => {
        console.log(`user id set to : ${user}`);

        handleEditorDidMount.current = (editor: any, monaco: any) => {
            console.log("Redefining mounting function ...")
            // Editor configurations
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

            // cursor & highlights capture
            editor.onDidChangeCursorSelection((event: any) => {
                const selection = event.selection;
                const startLine = selection.startLineNumber;
                const startColumn = selection.startColumn;
                const endLine = selection.endLineNumber;
                const endColumn = selection.endColumn;

                const currentState = provider.awareness.getLocalState()?.cursor?.range;
                const newState = { startLine, startColumn, endLine, endColumn };

                // Avoid triggering updates if the cursor hasn't changed
                if (JSON.stringify(currentState) !== JSON.stringify(newState)) {
                    // Update awareness with cursor/selection data
                    const newCursor = { user: user, range: newState, updatedAt: (new Date()).getTime() }
                    provider.awareness.setLocalStateField('cursor', newCursor);
                    console.log(newCursor);
                }
            });


            // Listen to awareness changes and update decorations
            provider.awareness.on('change', () => {
                const states = Array.from(provider.awareness.getStates().entries());

                const remoteCursors = states
                    .filter(([clientId]) => clientId !== provider.awareness.clientID)
                    .map(([, state]) => state.cursor)
                    .filter(thisCursor => !alreadyUpdated.includes(thisCursor.updatedAt));

                console.log("remote cursors: ", remoteCursors)///////////////////
                // Map remote cursors to Monaco decorations
                const newDecorations = remoteCursors.map((cursor) => ({
                    range: new monaco.Range(
                        cursor.range.startLine,
                        cursor.range.startColumn,
                        cursor.range.endLine,
                        cursor.range.endColumn
                    ),
                    options: {
                        className: 'remote-cursor-decoration',
                        isWholeLine: false,
                    },
                }));

                setAlreadyUpdated((prev: any) => {
                    return [...prev, ...remoteCursors.map(thisCursor => thisCursor.updatedAt)]
                })

                // Avoid redundant updates
                let decorationIds: string[] = [];

                decorationIds = editor.createDecorationsCollection(newDecorations);
                setCurrentDecorations(decorationIds);
                // if (decorationIds.toString() !== currentDecorations.toString()) {
                //     // decorationIds = editor.deltaDecorations(currentDecorations, newDecorations);
                // }
            });


            editorRef.current = editor;
            const ytext = ydoc.getText('code');
            new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
        }
    }, [user])



    const initialStateHandler = (id: string, initialState: Uint8Array) => {
        console.log('Connected as:', id);
        setUser(id);

        Y.applyUpdate(ydoc, new Uint8Array(initialState));
    };


    useEffect(() => {
        console.log("currentDecorations : ", currentDecorations);
    }, [currentDecorations])

    useEffect(() => {
        console.log("AlreadyUpdated : ", alreadyUpdated);
    }, [alreadyUpdated])


    useEffect(() => {
        socket.on('initialState', initialStateHandler);

        ydoc.on('update', (_upt, origin) => {
            if (origin !== provider) {
                const update = Y.encodeStateAsUpdate(ydoc);
                socket.emit('update', update);
            }
        });

        // On receiving an update.
        // provider.awareness.on('change', () => {
        //     const update = Y.encodeStateAsUpdate(ydoc); // Generate update
        //     socket.emit('update', update); // Send update to the backend
        // });


        // debugger
        // const ytext = ydoc.getText('code');
        // ytext.observe(event => {
        //     console.log('Document Change Detected:');
        //     event.changes.delta.forEach(change => {
        //         if (change.insert) {
        //             console.log('Inserted:', change.insert);
        //         }
        //         if (change.delete) {
        //             console.log('Deleted:', change.delete);
        //         }
        //         if (change.retain) {
        //             console.log('Retained:', change.retain);
        //         }
        //     });
        // });


        // sending cursor update to server
        // provider.awareness.on('change', () => {
        //     const states = Array.from(provider.awareness.getStates());
        //     socket.emit('awarenessUpdate', { states });
        // });

        // Handle awareness updates from the server
        // socket.on('awarenessUpdate', (data: { states: Record<string, any> }) => {
        //     Object.entries(data.states).forEach(([clientID, state]) => {
        //         const numericClientID = Number(clientID); // Convert clientID to a number
        //         const localState = provider.awareness.getStates().get(numericClientID);

        //         if (localState !== state) {
        //             provider.awareness.setLocalStateField('remote', state); // Update local state field
        //         }
        //     });
        // });


        return () => {
            socket.off('initialState', initialStateHandler);
        };
    }, [ydoc]);


    return (
        <div className=''>
            <InfoPanel user={user} />
            <CodeEditor handleEditorDidMount={(editor: any, monaco: any) => handleEditorDidMount.current?.(editor, monaco)} />
        </div>
    )
}