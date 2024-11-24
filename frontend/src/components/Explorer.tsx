import socket from "../util/socket";
import { useEffect, useState } from "react";

export default function Explorer () {
    const [fileTree, setFileTree] = useState<any>({});

    useEffect(() => {
        socket.emit('files');

        socket.on('file:refresh', (path:any) => {
            console.log('change in file tree : ', path)
        })

        socket.on('files', (tree) => {
            console.log("tree : ", tree);
            setFileTree(tree);
        })
    }, [])


    function renderChildren(node:any, nodeName:string):JSX.Element {
        if (node === null) {
            return <div key={nodeName} className="pl-2 hover:bg-gray-600/40">{nodeName}</div>;
        } else {
            return (
                <div key={nodeName} className="pl-2">
                    <div className="underline">{nodeName}</div>
                    <div className="pl-4">
                        {Object.keys(node).map((child) => renderChildren(node[child], child))}
                    </div>
                </div>
            );
        }
    }
    

    return (
        <div className="w-60 h-fill bg-sky-800/60">
            <div className="border border-black bg-blue-900/50 font-bold text-center">EXPLORER</div>
            {Object.keys(fileTree).map((nodeName) => renderChildren(fileTree[nodeName], nodeName))}
        </div>
    );
}