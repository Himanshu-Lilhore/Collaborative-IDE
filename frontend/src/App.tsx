import {useState, useEffect, useRef} from 'react';
import './App.css'
import CodeEditor from './components/CodeEditor'
import InfoPanel from './components/InfoPanel'
import { io } from "socket.io-client";
import Axios from 'axios';
Axios.defaults.withCredentials = true;
const socket = io(import.meta.env.VITE_BACKEND_URL);

export default function App() {
    const [user, setUser] = useState<string>('DEFAULT')
    const [code, setCode] = useState('// DEFAULT CODE');
    const timer = useRef<any>();
    const [trigger, setTrigger] = useState<Date | string>('DEFAULT');


    useEffect(() => {
        socket.on("connection", (id, cod) => {
            console.log('you are now connected as :', id);
            setUser(id);
            setCode(cod);
        })        
    }, [])


    useEffect(() => {
        socket.on('update', (updatedCode: string, sender: string) => {
            if(user !== 'DEFAULT' && user !== sender) {
                console.log(`${user} == ${sender} ??`);
                console.log('received code update');
                setCode(updatedCode);
            }
        })       
    }, [user])


    useEffect(() => {
        if(code === '// DEFAULT CODE' || trigger === 'DEFAULT') return;

        clearTimeout(timer.current);

        timer.current = setTimeout(() => {
            console.log('Sending code update...');
            socket.emit('update', code);
        }, 1000);
    }, [trigger])


    useEffect(() => {
        console.log(`user id set to : ${user}`);
    }, [user])
    useEffect(() => {
        console.log('Code updated.');
    }, [code])


    return (
        <div className=''>
            <InfoPanel user={user} />
            <CodeEditor code={code} setCode={setCode} setTrigger={setTrigger}/>
        </div>
    )
}