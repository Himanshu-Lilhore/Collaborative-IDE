import CloseIcon from "../assets/CloseIcon";
import colors from '../util/colors'
import Logo from "@/assets/Logo";

interface FileTreeNode {
    name: string,
    id: string,
    children: FileTreeNode[] | null
}


export default function OpenedFiles({ currFile }: { currFile: Partial<FileTreeNode> }) {
    return (
        <div className={`flex flex-row px-2 gap-2 ${colors.fileCabinetBg}`}>
            <Logo />
            <div className="flex flex-row">
                <FileTab file={currFile} />
            </div>
        </div>
    );
}

function FileTab({ file }: { file: Partial<FileTreeNode> }) {
    return (
        <div className="relative flex flex-row text-white gap-1 pl-3 pr-2 pb-1 items-center justify-between rounded-t-lg cursor-pointer"
            style={{ backgroundColor: colors.ideBg }}>
            <div className="font-semibold select-none">
                {file.name}
            </div>
            <button><CloseIcon /></button>

            <div className='absolute -right-[7px] bottom-0 h-[7px] w-[7px]' style={{ backgroundColor: colors.ideBg }}>
                <div className={`h-full w-full rounded-bl-2xl ${colors.fileCabinetBg}`} ></div>
            </div>
            <div className='absolute -left-[7px] bottom-0 h-[7px] w-[7px]' style={{ backgroundColor: colors.ideBg }}>
                <div className={`h-full w-full rounded-br-2xl ${colors.fileCabinetBg}`}></div>
            </div>
        </div>
    )
}

