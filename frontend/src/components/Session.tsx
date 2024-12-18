import { useEffect } from 'react';
import Axios from 'axios';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
Axios.defaults.withCredentials = true;

/*
socketUser/id state
editorRef
ydoc ref
docMap ref
unsavedDocsmap
ytext state
provider ref
handleEditorDidMount ref
decorations ref
trigger state
language state
currFile state
*/

export default function Session() {  
    const session = useSelector((state:any) => state.sessionStore);
    useEffect(() => {
        console.log(session)
    }, [])


    return (
        <>
            <Outlet />
        </>
    )
}