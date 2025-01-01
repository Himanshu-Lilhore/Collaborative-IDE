import CloseIcon from "../assets/CloseIcon";
import colors from '../util/colors'
import Logo from "@/assets/Euro";
import { useEffect, useState } from "react";
import { setCurrFile } from "@/features/session/sessionSlice.ts";
import * as types from '../types/index.ts';
import { useDispatch } from "react-redux";


export default function OpenedFiles({ currFile, loadDocument, provider }: { currFile: Partial<types.FileTreeNode>, loadDocument: any, provider: any }) {
    const [tabs, setTabs] = useState<Partial<types.FileTreeNode>[]>([])
    const [currNum, setCurrNum] = useState(1)
    const dispatch = useDispatch();

    useEffect(() => {
        if (currFile.id !== 'root' && currFile && !tabs.find(tab => tab.id === currFile.id)) {
            setTabs(prev => [...prev, currFile])
        }
    }, [currFile])
    useEffect(() => {
        setCurrNum(tabs.indexOf(currFile))
    }, [tabs, currFile])


    const openFile = (node: types.FileTreeNode) => {
        provider.current.awareness.setLocalState(null)
        loadDocument(node.id);
        dispatch(setCurrFile(node));
    }

    return (
        <div className={`flex flex-row px-2 gap-2 ${colors.fileCabinetBg}`}>
            <Logo />
            <div className="flex flex-row">
                {
                    tabs.map((file, idx) => {
                        return <FileTab key={file.id} file={file} currNum={currNum} idx={idx} setTabs={setTabs} openFile={openFile} />
                    })
                }
            </div>
        </div>
    );
}

function FileTab({ file, currNum, idx, setTabs, openFile }: { file: Partial<types.FileTreeNode>, currNum: number, idx: number, setTabs: any, openFile:any }) {

    return (
        <>
            {(idx < currNum) && <Separator />}

            <div className={`${currNum === idx ? 'rounded-t-lg py-1.5 pl-3 pr-2' : 'hover:text-zinc-800 hover:rounded-lg bg-transparent hover:bg-lime-400/70 my-1 pl-2 py-0.5 pr-2 mx-1'} 
                            relative flex flex-row text-white gap-1 items-center justify-between cursor-pointer`}
                style={{ backgroundColor: currNum === idx ? colors.ideBg : '' }}
                onClick={() => openFile(file)}>
                <div className="font-sans font-medium text-sm select-none">
                    {file.name}
                </div>
                <button onClick={() => setTabs((prev: any) => { return (prev.filter((tab: any) => tab.id !== file.id)) })}><CloseIcon /></button>

                {currNum === idx &&
                    <>
                        <div className='absolute -right-[7px] bottom-0 h-[7px] w-[7px]' style={{ backgroundColor: colors.ideBg }}>
                            <div className={`h-full w-full rounded-bl-2xl ${colors.fileCabinetBg}`} ></div>
                        </div>
                        <div className='absolute -left-[7px] bottom-0 h-[7px] w-[7px]' style={{ backgroundColor: colors.ideBg }}>
                            <div className={`h-full w-full rounded-br-2xl ${colors.fileCabinetBg}`}></div>
                        </div>
                    </>
                }
            </div>

            {(idx > currNum) && <Separator />}
        </>
    )
}

function Separator() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="h-2/3 border opacity-50"></div>
        </div>
    )
}