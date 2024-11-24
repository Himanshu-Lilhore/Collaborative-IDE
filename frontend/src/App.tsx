import { useState, useEffect, useRef } from 'react';
import './App.css'
import Axios from 'axios';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { MonacoBinding } from 'y-monaco';
import CodeEditor from './components/CodeEditor';
import Terminal from './components/Terminal';
import InfoPanel from './components/InfoPanel'
import Explorer from './components/Explorer';
import socket from './util/socket';

Axios.defaults.withCredentials = true;

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
    const decorations = useRef<any>(null);
    const [trigger, setTrigger] = useState<any>(Date())
    const [language, setLanguage] = useState('html');


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
                    'editor.selectionBackground': '#00fff020',
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
                if ((JSON.stringify(currentState) !== JSON.stringify(newState))
                    // || (newState.startLine===newState.endLine && newState.startColumn===newState.endColumn)
                ) {
                    // Update awareness with cursor/selection data
                    let newCursor: any = { user: user, range: newState };

                    const currentAwareness = provider.awareness.getLocalState();
                    // console.log('currentAwareness', currentAwareness); /////////////
                    if (currentAwareness && currentAwareness.cursor) {
                        newCursor = null; // Clear old cursor state
                    }

                    provider.awareness.setLocalStateField('cursor', newCursor);
                    console.log(newCursor); ////////////////
                }
            });

            // Listen to awareness changes and update decorations
            provider.awareness.on('change', (_added: any, _updated: any, _removed: any) => {
                const states = Array.from(provider.awareness.getStates().entries());

                const remoteCursors = states
                    .filter(([clientId]) => clientId !== provider.awareness.clientID)
                    .map(([, state]) => state.cursor)
                    .filter(Boolean)

                console.log("remote cursors: ", remoteCursors)///////////////////

                // Map remote cursors to Monaco decorations
                const newDecorations = remoteCursors.map((cursor) => ({
                    range: new monaco.Range(
                        cursor?.range.startLine,
                        cursor?.range.startColumn,
                        cursor?.range.endLine,
                        cursor?.range.endColumn
                    ),
                    options: {
                        className: 'remote-cursor-decoration',
                        isWholeLine: false,
                    },
                }));
                console.log("newDec", newDecorations)

                // Apply updates
                if (decorations.current) decorations.current.clear();
                decorations.current = editor.createDecorationsCollection(newDecorations);
            });


            editorRef.current = editor;
            const ytext = ydoc.getText('code');
            new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);

            socket.on('disconnected', () => {
                setTrigger(new Date().getTime())
                console.log('disconnection received');
                if (decorations.current) decorations.current.clear();
            });
        }
    }, [user])


    const initialStateHandler = (id: string, initialState: Uint8Array) => {
        console.log('Connected as:', id);
        setUser(id);

        Y.applyUpdate(ydoc, new Uint8Array(initialState));
    };


    useEffect(() => {
        socket.on('initialState', initialStateHandler);

        ydoc.on('update', (_upt, origin) => {
            if (origin !== provider) {
                const update = Y.encodeStateAsUpdate(ydoc);
                socket.emit('update', update);
            }
        });


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


        return () => {
            socket.off('initialState', initialStateHandler);
        };
    }, [ydoc]);


    return (
        <div className=''>
            <InfoPanel user={user} language={language} setLanguage={setLanguage} />

            <div className='flex flex-row'>
                <Explorer />
                <div className='flex flex-col h-full w-full'>
                    <div className='h-3/5'>
                        <CodeEditor
                            trigger={trigger}
                            handleEditorDidMount={(editor: any, monaco: any) => handleEditorDidMount.current?.(editor, monaco)}
                            language={language}
                        />
                    </div>
                    <div >
                        <Terminal />
                    </div>
                </div>
            </div>
        </div>
    )
}