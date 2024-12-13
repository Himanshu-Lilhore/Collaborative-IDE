import LangSelect from './LangSelect'
import colors from '../util/colors'
import { AnimatedTooltip } from './ui/animated-tooltip'
import Logo from '@/assets/Logo'
import ParticipantsIcon from '@/assets/ParticipantsIcon'
import ChatIcon from '@/assets/ChatIcon'
import VideoIcon from '@/assets/VideoIcon'
import ShareIcon from '@/assets/ShareIcon'
import UserIcon from '@/assets/UserIcon'
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'


const users = [
    { id: 1, name: 'blue', designation: '', image: '' },
    { id: 2, name: 'green', designation: '', image: '' },
    { id: 3, name: 'pink', designation: '', image: '' },
    { id: 4, name: 'gray', designation: '', image: '' },
]

export default function InfoPanel({ user, language, setLanguage }: { user: string, language: any, setLanguage: any }) {
    const navigate = useNavigate()

    return (
        <div className={`flex flex-row p-2 justify-between items-center w-full ${colors.primary1}`}>
            <div className='flex flex-row gap-2 justify-between items-center px-2'>
                {/* icon  */}
                <div><Logo /></div>

                {/* proj name  */}
                <div className='text-xl open-sans-medium'>Test project</div>

                {/* <div>Saving...</div> */}
            </div>

            <div className='flex flex-row gap-5 justify-between items-center px-2'>
                {/* Language selector  */}
                {/* <div className="flex gap-4 flex-row">
                    {
                        <LangSelect language={language} setLanguage={setLanguage} />
                    }
                </div> */}
                {/* Participants  */}
                <div className='flex flex-row gap-1 p-1 items-center'>
                    <div><ParticipantsIcon /></div>
                    <AnimatedTooltip items={users} />
                </div>
                {/* chat  */}
                <div><ChatIcon /></div>
                {/* vid call  */}
                <div><VideoIcon /></div>
                {/* share */}
                <button className='flex flex-row rounded-sm justify-between items-center gap-1 py-1 px-4 bg-blue-600 hover:bg-blue-700'>
                    <div className='open-sans-medium'>Share</div>
                    <div><ShareIcon /></div>
                </button>
                {/* user profile  */}
                <div title={user}><UserIcon /></div>

                <Link to="/user/register" className="underline ms-2 text-sm font-medium text-gray-100">
                    Register
                </Link>
                <Link to="/user/login" className="underline ms-2 text-sm font-medium text-gray-100">
                    Login
                </Link>
            </div>
        </div>
    )
}