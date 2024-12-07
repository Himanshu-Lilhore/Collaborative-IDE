import LangSelect from './LangSelect'
import colors from '../util/colors'
import { AnimatedTooltip } from './ui/animated-tooltip'
const users = [
    {id:1, name:'blue', designation: '', image: ''},
    {id:2, name:'green', designation: '', image: ''},
    {id:3, name:'pink', designation: '', image: ''},
    {id:4, name:'gray', designation: '', image: ''},
]

export default function InfoPanel({ user, language, setLanguage }: { user: string, language: any, setLanguage: any }) {
    return (
        <div className={`flex flex-row justify-between items-center w-full ${colors.primary1}`}>
            <div>{`USER : ${user}`}</div>
            {/* <div>Saving...</div> */}
            <div className='flex flex-row p-1 items-center'>Other users : :<AnimatedTooltip items={users} /></div>
            <div className="flex gap-4 flex-row">
                {
                    <LangSelect language={language} setLanguage={setLanguage} />
                }
            </div>
        </div>
    )
}