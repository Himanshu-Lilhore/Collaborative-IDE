// import { useEffect } from 'react'
// import GetStartedBtn from './GetStartedBtn'
// import { defaultUser } from '../utils/defaultUser'
// import Axios from 'axios'
// import { checkToken } from '../utils/checkToken'
// import { useUser } from '../utils/UserProvider'
import MainHeading from './MainHeading'
import Slogan from './Slogan'
import CreateSessionBtn from './CreateSessionBtn'

export default function Home() {
    // const { userData, setUserData } = useUser()

    // useEffect(() => {
    //     const logoutPrevUser = async () => {
    //         if (checkToken()) {
    //             const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/logout`)
    //             if (response.status === 200) {
    //                 setUserData({ ...defaultUser })
    //                 console.log("Previous user logged out.")
    //             }
    //         }
    //     }

    //     logoutPrevUser()
    // }, [])

    return (
        <>
            <div className='flex flex-col select-none'>
                <div className='flex justify-center'>
                    <Slogan />
                </div>
                <div className='w-full justify-center flex items-center flex-col sm:flex-row'>
                    <div className='m-8'>
                        <MainHeading />
                    </div>
                    <div className='flex flex-col justify-center mt-8'>
                        <CreateSessionBtn />
                    </div>
                </div>
            </div>
        </>
    )
}