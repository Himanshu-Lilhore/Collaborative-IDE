// import socket from '../util/socket';
import getSocket from '../util/socket';
const socket = getSocket();
import { useEffect, useRef, useState } from 'react';
import Axios from 'axios';
import * as Y from 'yjs';
import { SocketIOProvider } from 'y-socket.io';
import { MonacoBinding } from 'y-monaco';
import CodeEditor from '../components/CodeEditor';
import Terminal from '../components/Terminal';
import InfoPanel from '../components/InfoPanel'
import Explorer from '../components/Explorer';
import OpenedFiles from '../components/OpenedFiles';
import colors from '../util/colors'
import { useDispatch, useSelector } from 'react-redux';
import { setSocketUser, setTrigger } from '@/features/session/sessionSlice';
Axios.defaults.withCredentials = true;


export default function Playground() {
    const dispatch = useDispatch()
    const socketUser = useSelector((state:any) => state.sessionStore.socketUser)
    const currFile = useSelector((state:any) => state.sessionStore.currFile)
    let ydoc = useRef(new Y.Doc()).current;
    const [ytext, setYtext] = useState<Y.Text>(ydoc.getText('default'));
    const editorRef = useRef<any>(null)
    let docMap = useRef<Y.Map<Y.Text>>(ydoc.getMap('documents')).current;
    // const unsavedDocsMap = useRef<Y.Map<string>>(ydoc.getMap('unsavedDocs')).current;
    const handleEditorDidMount = useRef<any>();
    const decorations = useRef<any>(null);
    const provider = useRef(
        new SocketIOProvider(
            import.meta.env.VITE_BACKEND_URL,
            'my-room',
            ydoc,
            { autoConnect: true }
        )
    );


    const loadDocument = (docId: string) => {
        let currentYtext= docMap.get(docId) as Y.Text;
        if (!currentYtext) {
            console.log("Doc didn't exist")
            // If the document doesn't exist, create a new Y.Text and store it in the Y.Map
            currentYtext = new Y.Text();
            docMap.set(docId, currentYtext);
            console.log(`Created a new document with ID: ${docId}`);
        } else {
            console.log("Doc exists")
        }
        setYtext(currentYtext); // Update the state to use this Y.Text
    };

    useEffect(() => {
        loadDocument('default'); // Replace 'default' with the desired document ID
        ydoc.on('update', (_upt, origin) => {
            if (origin !== provider) {
                const update = Y.encodeStateAsUpdate(ydoc);
                socket.emit('update', update);
            }
        });
    }, []);


    useEffect(() => {
        handleEditorDidMount.current = (editor: any, monaco: any) => {
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

                const currentState = provider.current.awareness.getLocalState()?.cursor?.range;
                const newState = { startLine, startColumn, endLine, endColumn };

                // Avoid triggering updates if the cursor hasn't changed
                if ((JSON.stringify(currentState) !== JSON.stringify(newState))
                    // || (newState.startLine===newState.endLine && newState.startColumn===newState.endColumn)
                ) {
                    // Update awareness with cursor/selection data
                    let newCursor: any = { user: socketUser, range: newState };

                    const currentAwareness = provider.current.awareness.getLocalState();
                    // console.log('currentAwareness', currentAwareness); /////////////
                    if (currentAwareness && currentAwareness.cursor) {
                        newCursor = null; // Clear old cursor state
                    }

                    provider.current.awareness.setLocalStateField('cursor', newCursor);
                    console.log(newCursor); ////////////////
                }
            });

            // Listen to awareness changes and update decorations
            provider.current.awareness.on('change', (_added: any, _updated: any, _removed: any) => {
                const states = Array.from(provider.current.awareness.getStates().entries());

                const remoteCursors = states
                    .filter(([clientId]) => clientId !== provider.current.awareness.clientID)
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
            new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), provider.current.awareness);

            socket.on('disconnected', () => {
                dispatch(setTrigger())
                console.log('disconnection received');
                if (decorations.current) decorations.current.clear();
            });
        }
        
        dispatch(setTrigger());  // to rerender the editor on selecting new doc
        console.log('useEffect run complete...')
    }, [ytext])


    useEffect(() => {
        console.log(`socket user id set to : ${socketUser}`);//////////////
    }, [socketUser])

    useEffect(() => {
        console.log(`currFile set to : ${currFile.name}`);/////////////S
    }, [currFile])



    const initialStateHandler = (data: { id: string; initialState: Uint8Array }) => {
        console.log('Connected as:', data.id);/////////////
        dispatch(setSocketUser(data.id));
    
        Y.applyUpdate(ydoc, new Uint8Array(data.initialState));
        docMap = ydoc.getMap('documents')
    };    


    useEffect(() => {
        socket.on('initialState', initialStateHandler);
        socket.emit('initialState');

        // ytext.observe((_event: any) => {
        //     if (!unsavedDocsMap.has(currFile.id)) {
        //         unsavedDocsMap.set(currFile.id, new Date().getTime().toString())
        //         console.log(`${currFile.name} added to unsaved docs`);
        //     }

        //     // You can inspect the changes in the event
        //     // event.delta.forEach((change:any) => {
        //     //     if (change.insert) {
        //     //         console.log('Inserted text:', change.insert);
        //     //     }
        //     //     if (change.delete) {
        //     //         console.log('Deleted characters:', change.delete);
        //     //     }
        //     //     if (change.retain) {
        //     //         console.log('Retained characters:', change.retain);
        //     //     }
        //     // });
        // });

        return () => {
            socket.off('initialState', initialStateHandler);
        };
    }, [ytext]);


    return (
        <>
            <div className='relative text-white'>
                <InfoPanel />

                <div className='flex flex-row'>
                    <Explorer loadDocument={loadDocument} ydoc={ydoc} provider={provider} editorRef={editorRef} />

                    <div className={`flex flex-col w-full ${colors.primary1}`}>
                        <div className='flex flex-col flex-1 rounded-xl border-2 border-gray-900/70 overflow-hidden bg-white'>
                            <OpenedFiles currFile={currFile} />
                            <CodeEditor
                                handleEditorDidMount={(editor: any, monaco: any) => handleEditorDidMount.current?.(editor, monaco)}
                            />
                            <Terminal />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}