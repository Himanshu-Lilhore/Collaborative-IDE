import CloseIcon from "../assets/CloseIcon";

interface FileTreeNode {
    name: string,
    id: string,
    children: FileTreeNode[] | null
}
export default function OpenedFiles({ currFile }: { currFile: Partial<FileTreeNode> }) {
    return (
        <div className="flex flex-row mx-1 mt-1">
            <FileTab file={currFile} />
        </div>
    );
}

function FileTab({ file }: { file: Partial<FileTreeNode> }) {
    return (
        <div className="flex flex-row gap-1 pl-3 pr-2 py-1 items-center justify-between border-t-4 border-sky-600/80 bg-gray-600/70 rounded-t-md cursor-pointer">
            <div className="font-semibold">
                {file.name}
            </div>
            <button><CloseIcon /></button>
        </div>
    )
}