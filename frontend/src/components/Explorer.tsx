import socket from "../util/socket";
import { useEffect, useState } from "react";
import SaveIcon from "../assets/SaveIcon.tsx"
import axios from 'axios';
import colors from '../util/colors'
import * as types from '../types/index.ts'


export default function Explorer({ Y, loadDocument, ydoc, provider, editorRef, currFile, setCurrFile }: { Y: any, loadDocument: any, ydoc: any, provider: any, editorRef: any, currFile: types.FileTreeNode, setCurrFile: any }) {
    const [fileTree, setFileTree] = useState<types.FileTreeNode>({ name: 'root', id: 'root', children: null });


    useEffect(() => {
        socket.on('file:refresh', (path: any) => {
            console.log('change in file tree : ', path)
        })

        socket.on('filetree', (tree) => {
            console.log("tree : ", tree);
            setFileTree(tree);
        })
    }, [])


    const saveProj = async () => {
        console.log('sending save project request ...')

        try {
            axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/project/save`, {})
                .then(response => {
                    console.log('Data saved successfully:', response.data);
                })
                .catch(error => {
                    console.error('Error saving data:', error);
                });
        } catch (err: any) {
            console.log(err.message);
        }
    }


    return (
        <div className={`flex flex-col gap-1 w-60 h-fill ${colors.primary1} p-1 px-2 select-none`}>
            <div className="border border-black bg-blue-900/50 font-bold text-center">EXPLORER</div>
            <div className="flex flex-row gap-1 justify-end font-bold text-center">
                <button className="flex-auto border border-black bg-blue-900/50 px-2 hover:bg-blue-700/50">+folder</button>
                <button className="flex-auto border border-black bg-blue-900/50 px-2 hover:bg-blue-700/50">+file</button>
                <button onClick={() => saveProj()} className="flex-auto hover:scale-105 flex justify-center items-center">
                    <SaveIcon color={`#000`} />
                </button>
            </div>
            <div className="p-1">
                {fileTree.children &&
                    fileTree.children?.map((child: types.FileTreeNode) => <TreeNode Y={Y} node={child} key={child.id} loadDocument={loadDocument} ydoc={ydoc} currFile={currFile} setCurrFile={setCurrFile} provider={provider} editorRef={editorRef} />)}
            </div>
        </div>
    );
}


function TreeNode({ Y, node, loadDocument, ydoc, currFile, setCurrFile, provider, editorRef }: { Y: any, node: types.FileTreeNode, loadDocument: any, ydoc: any, currFile: types.FileTreeNode, setCurrFile: any, provider: any, editorRef: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => setIsExpanded(!isExpanded);


    const openFile = (node: types.FileTreeNode) => {
        provider.current.awareness.setLocalState(null)
        socket.emit('filecachecheck', node.id, async (response: any) => {
            if (!response.fileWasInCache) {
                Y.applyUpdate(ydoc, new Uint8Array(response.newDoc));
                console.log("File was NOT in cache")
            } else {
                console.log("File was in cache")
            }
            loadDocument(node.id);
            setCurrFile(node);
        });
        // setYtext(ydoc.getText(id));
        // socket.emit('filechange', id);
    }


    if (node.children === null) {
        return <div key={node.id} id={node.id}
            className={`${currFile.id === node.id ? 'bg-gray-600/50' : ''} pl-1 rounded-sm hover:bg-gray-600/40 cursor-pointer`}
            onClick={() => openFile(node)}>
            🖹 {node.name}
        </div>;
    } else {
        return (
            <div key={node.id} id={node.id} className="rounded-sm">
                <div className='pl-1 hover:bg-gray-600/40 whitespace-pre cursor-pointer' onClick={() => toggleExpand()}>{isExpanded ? "🞃 " : " 🞂 "}{node.name}</div>
                {isExpanded && <div className="pl-2 ml-2 border-l-2 border-transparent hover:border-black/70">
                    {node.children.map((child: any) => <TreeNode Y={Y} node={child} key={child.id} loadDocument={loadDocument} ydoc={ydoc} currFile={currFile} setCurrFile={setCurrFile} provider={provider} editorRef={editorRef} />)}
                </div>}
            </div>
        );
    }
}

