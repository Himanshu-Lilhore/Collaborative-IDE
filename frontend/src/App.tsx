import './App.css'
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { useDispatch } from 'react-redux'
import { clearUser, setUser } from '@/features/user/userSlice'
import { useNavigate } from 'react-router-dom';
import { useEffect } from "react";
import Axios from 'axios';
import getSocket from '@/util/socket';
const socket = getSocket();
import { useToast } from "@/hooks/use-toast"

Axios.defaults.withCredentials = true;


export default function PlaceHolder() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { toast } = useToast()

    useEffect(() => {
        socket.on('error', (err:any) => {
            toast({
                description: err,
                variant: 'destructive'
            })
        })

        const handleFetch = async () => {
            try {
                const response = await Axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/profile`)

                if (response.status === 200) {
                    console.log('Profile fetched successfully:', response.data)
                    dispatch(setUser({ ...response.data }))
                } else if (response.status === 300) {
                    console.log('Token is invalid or expired.')
                } else {
                    console.log('Fetch not working')
                }
            } catch (error) {
                console.error('Fetching profile failed:', error)
                dispatch(clearUser())
                console.log('Redirecting to login page.')
                navigate('/user/login')
            }
        }

        handleFetch()
    }, [])

    return (
        <div className='dark'>
            <Outlet />
            <Toaster />
        </div>
    )
}