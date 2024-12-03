import socket from "../util/socket";
import { useEffect, useState } from "react";
import SaveIcon from "../assets/SaveIcon.tsx"

interface FileTreeNode {
    name: string,
    id: string,
    children: FileTreeNode[] | null
}

export default function Explorer({ Y, loadDocument, ydoc, provider, editorRef, currFile, setCurrFile }: { Y:any, loadDocument: any, ydoc: any, provider: any, editorRef: any, currFile: FileTreeNode, setCurrFile: any }) {
    const [fileTree, setFileTree] = useState<FileTreeNode>({ name: 'root', id: 'root', children: null });


    useEffect(() => {
        socket.on('file:refresh', (path: any) => {
            console.log('change in file tree : ', path)
        })

        socket.on('filetree', (tree) => {
            console.log("tree : ", tree);
            setFileTree(tree);
        })
    }, [])


    return (
        <div className="flex flex-col gap-1 w-60 h-fill bg-sky-800/60 p-1 select-none">
            <div className="border border-black bg-blue-900/50 font-bold text-center">EXPLORER</div>
            <div className="flex flex-row gap-1 justify-end font-bold text-center">
                <button className="flex-auto border border-black bg-blue-900/50 px-2 hover:bg-blue-700/50">+folder</button>
                <button className="flex-auto border border-black bg-blue-900/50 px-2 hover:bg-blue-700/50">+file</button>
                <button className="flex-auto hover:scale-105 flex justify-center items-center">
                    <SaveIcon color={`#000`}/>
                </button>
            </div>
            <div className="p-1">
                {fileTree.children &&
                    fileTree.children?.map((child: FileTreeNode) => <TreeNode Y={Y} node={child} key={child.id} loadDocument={loadDocument} ydoc={ydoc} currFile={currFile} setCurrFile={setCurrFile} provider={provider} editorRef={editorRef} />)}
            </div>
        </div>
    );
}


function TreeNode({ Y, node, loadDocument, ydoc, currFile, setCurrFile, provider, editorRef }: { Y:any, node: FileTreeNode, loadDocument: any, ydoc: any, currFile: FileTreeNode, setCurrFile: any, provider: any, editorRef: any }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => setIsExpanded(!isExpanded);


    const openFile = (node: FileTreeNode) => {
        provider.current.awareness.setLocalState(null)
        socket.emit('filecachecheck', node.id, (response:any) => {
            if(!response.fileWasInCache) {
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

