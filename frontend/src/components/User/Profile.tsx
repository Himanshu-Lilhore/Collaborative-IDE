import Axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import DataRow from './DataRow'
import { useSelector } from 'react-redux'
import PageHeading from '../PageHeading'
Axios.defaults.withCredentials = true

export default function Profile() {
    const userData = useSelector((state: any) => state.userStore)
    const navigate = useNavigate()
    const fieldsNotToDisplay = ['projects', 'session']

    function handleClick() {
        navigate('/user/profile-update')
    }

    return (
        <div className="flex items-center justify-center w-full">
            <Link to='/user/projects' className='border border-gray-300 bg-gray-500 p-2 rounded-md'>Projects</Link>
            <div className='flex flex-col my-5'>

                <PageHeading>Profile</PageHeading>

                <div className="w-full max-w-lg border-2 border-blue-600 dark:border-blue-500 rounded-lg shadow bg-slate-200 dark:bg-gray-900 mb-5">
                    <div className="flex flex-col items-center p-10">

                        <h1 className="text-right mb-1 text-xl font-bold text-blue-600 dark:text-blue-500 w-full">{`@ ${userData.username.toLowerCase()}`}</h1>


                        <div className="flex flex-col justify-between items-center py-5 w-full">
                            {Object.keys(userData).map((myKey, itr) => {
                                if (!fieldsNotToDisplay.includes(myKey)) {
                                    return <DataRow key={itr} dataType={myKey} dataVal={userData[myKey]} />
                                }
                            })}
                        </div>

                        <button onClick={handleClick} className='text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-lg px-7 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'>✏️ EDIT</button>

                    </div>
                </div>

            </div>
        </div>
    )
}