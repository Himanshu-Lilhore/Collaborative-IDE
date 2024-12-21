import { useEffect, useState } from 'react';
import Axios from 'axios';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSession, setProject } from '@/features/session/sessionSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Switch } from './ui/switch';

Axios.defaults.withCredentials = true;


export default function Session() {
    const session = useSelector((state: any) => state.sessionStore);
    const user = useSelector((state: any) => state.userStore);
    const { UrlSessionId } = useParams();
    const dispatch = useDispatch();
    const [creatingSession, setCreatingSession] = useState(false);
    const [hasAccessToSession, setHasAccessToSession] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const { toast } = useToast()
    const navigate = useNavigate()



    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/session/get`, {
                    sessionId: UrlSessionId
                });

                if (res.status === 200 && res.data) {
                    if ((!res.data.isPrivate) ||
                        user.sessions.includes(UrlSessionId) ||
                        user._id === session.admin) {
                        dispatch(setSession({
                            _id: res.data._id,
                            participants: [user._id],
                            project: res.data.project,
                            sessionFileTree: res.data.sessionFileTree,
                            currFile: { name: 'root', id: 'root', children: null }
                        }))
                        setHasAccessToSession(true);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }

        fetchSession();
    }, [])


    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/project/get`, {
                    _id: session.project
                });

                if (res.status === 200 && res.data) {
                    dispatch(setProject(res.data))
                    setHasAccessToSession(true);
                }
            } catch (err) {
                console.log(err);
            }
        }

        if (typeof session.project === 'string') fetchProject();
    }, [session.project])


    const onJoin = async () => {
        try {
            const res = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/session/join`, {
                _id: UrlSessionId,
                password
            })
            if (res.status === 200) {
                dispatch(setSession({
                    _id: res.data._id,
                    participants: [user._id],
                    project: res.data.project,
                    sessionFileTree: res.data.sessionFileTree,
                    currFile: { name: 'root', id: 'root', children: null }
                }))
                setHasAccessToSession(true);
                toast({
                    description: "Joining session"
                })
            }
        } catch (err) {
            console.log(err);
            toast({
                description: "Invalid Password OR Session does not exist",
                variant: 'destructive'
            })
        }
        setPassword('')
    }


    const onCreate = async () => {
        try {
            const res = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/session/create`, {
                password,
                isPrivate
            })
            if (res.status === 200 && res.data) {
                dispatch(setSession({
                    _id: res.data._id,
                    participants: [user._id],
                    project: res.data.project,
                    sessionFileTree: res.data.sessionFileTree,
                    currFile: { name: 'root', id: 'root', children: null }
                }))
                navigate(`/session/${res.data._id}`);
                setHasAccessToSession(true);
                toast({
                    description: "Session created successfully"
                })
            }
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <>
            {
                hasAccessToSession ?
                    <Outlet />
                    :
                    <div className='flex flex-col gap-3'>
                        {creatingSession ?
                            <>
                                <div>Create Session</div>
                                <div>
                                    <div>Private :</div>
                                    <Switch id="access"
                                        checked={isPrivate}
                                        onCheckedChange={() => setIsPrivate(prev => !prev)}
                                    />
                                </div>
                                <div className="flex w-full max-w-sm items-center space-x-2">
                                    {isPrivate &&
                                        <Input placeholder='Password' />
                                    }
                                    <Button onClick={onCreate}>Create Session</Button>
                                </div>
                                <button onClick={() => setCreatingSession(prev => !prev)} className='underline underline-offset-2'>Join session</button>
                            </>
                            :
                            <>
                                <div>Session ID{` : ${UrlSessionId}`}</div>
                                <div className="flex w-full max-w-sm items-center space-x-2">
                                    <Input value={password} placeholder='Password' onChange={(e) => setPassword(e.target.value)} />
                                    <Button onClick={onJoin}>Join Session</Button>
                                </div>
                                <button onClick={() => setCreatingSession(prev => !prev)} className='underline underline-offset-2'>Create session</button>
                            </>
                        }
                    </div>
            }
        </>
    )
}