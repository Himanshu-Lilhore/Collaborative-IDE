import socket from "../util/socket";
import { useEffect, useState } from "react";
interface FileTreeNode {
    name: string,
    id: string,
    children: FileTreeNode[] | null
}

export default function Explorer() {
    const [fileTree, setFileTree] = useState<FileTreeNode>({ name: 'root', id: 'root', children: null });

    useEffect(() => {
        socket.emit('files');

        socket.on('file:refresh', (path: any) => {
            console.log('change in file tree : ', path)
        })

        socket.on('files', (tree) => {
            console.log("tree : ", tree);
            setFileTree(tree);
        })
    }, [])


    return (
        <div className="w-60 h-fill bg-sky-800/60 p-1 select-none">
            <div className="border border-black bg-blue-900/50 font-bold text-center">EXPLORER</div>
            <div className="p-1">
                {fileTree.children?.map((child: FileTreeNode) => <TreeNode node={child} key={child.id}/>)}
            </div>
        </div>
    );
}


// function renderChildren(node: any): JSX.Element {


//     if (node.children === null) {
//         return <div key={node.id} className="pl-1 rounded-sm hover:bg-gray-600/40">{node.name}</div>;
//     } else {
//         return (
//             <div key={node.id} className="rounded-sm">
//                 <div className="underline pl-1 hover:bg-gray-600/40" onClick={() => toggleExpand()}>{node.name}</div>
//                 {isExpanded && <div className="pl-2 ml-2 border-l-2 border-transparent hover:border-black/70">
//                     {node.children.map((child: any) => renderChildren(child))}
//                 </div>}
//             </div>
//         );
//     }
// }

function TreeNode({ node }: { node: FileTreeNode }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const toggleExpand = () => setIsExpanded(!isExpanded);

    if (node.children === null) {
        return <div key={node.id} className="pl-1 rounded-sm hover:bg-gray-600/40 cursor-pointer">🖹 {node.name}</div>;
    } else {
        return (
            <div key={node.id} className="rounded-sm">
                <div className="pl-1 hover:bg-gray-600/40 whitespace-pre cursor-pointer" onClick={() => toggleExpand()}>{isExpanded ? "🞃 " : " 🞂 " }{node.name}</div>
                {isExpanded && <div className="pl-2 ml-2 border-l-2 border-transparent hover:border-black/70">
                    {node.children.map((child: any) => <TreeNode node={child} key={child.id} />)}
                </div>}
            </div>
        );
    }
}