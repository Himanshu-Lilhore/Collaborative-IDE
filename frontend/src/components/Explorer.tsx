// import socket from '@/util/socket';
import getSocket from '@/util/socket';
const socket = getSocket();
import { useEffect, useState } from "react";
import colors from '../util/colors'
import * as types from '../types/index.ts'
import { useDispatch, useSelector } from "react-redux";
import { setCurrFile, setSessionFileTree } from "@/features/session/sessionSlice.ts";
import * as Y from 'yjs';


export default function Explorer({ loadDocument, ydoc, provider, editorRef }: { loadDocument: any, ydoc: any, provider: any, editorRef: any }) {
    const sessionFileTree: types.FileTreeNode[] = useSelector((state: any) => state.sessionStore.sessionFileTree)
    const userId: string = useSelector((state: any) => state.userStore._id)
    const dispatch = useDispatch();
    const [input, setInput] = useState('')

    useEffect(() => {
        socket.emit('filetree')
        socket.on('filetree', (tree:any) => {
            console.log("tree : ", tree);
            dispatch(setSessionFileTree(tree))
        })
    }, [])

    // useEffect(() => {
    //     console.log("currfile : ", currFile)
    //     console.log("filetree : ", sessionFileTree)
    // }, [currFile, sessionFileTree])


    const createFile = async () => {
        const fileName = input || 'test.txt'
        
        socket.emit('addFile', { filePath: `/user/${fileName}`, userId: userId });

        setInput('')
    }

    const createFolder = async () => {
        const folderName = input || 'testFolder'
        
        socket.emit('addFolder', { folderPath: `/user/${folderName}` });

        setInput('')
    }

    return (
        <div className={`flex flex-col gap-1 w-60 h-fill ${colors.primary1} p-1 px-2 select-none`}>
            <div className="border border-black bg-blue-900/50 font-bold text-center">EXPLORER</div>
            <div className="flex flex-row gap-1 justify-end font-bold text-center">
                {/* create folder  */}
                <button onClick={createFolder} className="flex-auto border border-black bg-blue-900/50 px-2 hover:bg-blue-700/50">+folder</button>
                {/* create file  */}
                <button onClick={createFile} className="flex-auto border border-black bg-blue-900/50 px-2 hover:bg-blue-700/50">+file</button>
            </div>

            <div>
                <input className="text-black" value={input} onChange={(e) => setInput(e.target.value)} />
            </div>

            {/* file tree  */}
            <div className="p-1">
                {sessionFileTree && sessionFileTree.length > 0 &&
                    sessionFileTree.map((child: types.FileTreeNode) =>
                        <TreeNode node={child}
                            key={child.id}
                            loadDocument={loadDocument}
                            ydoc={ydoc}
                            provider={provider}
                            editorRef={editorRef} />)
                }
            </div>
        </div>
    );
}


function TreeNode({ node, loadDocument, ydoc, provider, editorRef }:
    { node: types.FileTreeNode, loadDocument: any, ydoc: any, provider: any, editorRef: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => setIsExpanded(!isExpanded);
    const currFile = useSelector((state: any) => state.sessionStore.currFile)
    const dispatch = useDispatch()


    const openFile = (node: types.FileTreeNode) => {
        provider.current.awareness.setLocalState(null)
        console.log("sending node to read file : ", node)/////////////////

        socket.emit('filecachecheck', node, async (response: any) => {
            if (!response.fileWasInCache) {
                Y.applyUpdate(ydoc, new Uint8Array(response.newDoc));
                console.log("File was NOT in cache")
            } else {
                console.log("File was in cache")
            }
            loadDocument(node.id);
            dispatch(setCurrFile(node));
        });
    }

    // const deleteFile = async () => {
    //     const folderName = input || 'testFolder'
        
    //     socket.emit('addFolder', { filePath: `/user/${folderName}` });

    //     setInput('')
    // }

    
    if (node.children === null) {
        return (
            <div key={node.id} id={node.id}
                className={`${currFile.id === node.id ? 'bg-gray-600/50' : ''} pl-1 rounded-sm hover:bg-gray-600/40 cursor-pointer`}
                onClick={() => openFile(node)}>
                🖹 {node.name}
            </div>
        );
    } else {
        return (
            <div key={node.id} id={node.id} className="rounded-sm">
                <div className='pl-1 hover:bg-gray-600/40 whitespace-pre cursor-pointer'
                    onClick={() => toggleExpand()}>
                    {isExpanded ? "🞃 " : " 🞂 "}{node.name}
                </div>
                {
                    isExpanded &&
                    <div className="pl-2 ml-2 border-l-2 border-transparent border-white/10 hover:border-white/50">
                        {
                            node.children.map((child: any) =>
                                <TreeNode node={child}
                                    key={child.id}
                                    loadDocument={loadDocument}
                                    ydoc={ydoc} provider={provider}
                                    editorRef={editorRef} />)
                        }
                    </div>
                }
            </div>
        );
    }
}

