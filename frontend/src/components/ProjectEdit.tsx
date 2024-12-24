import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import * as types from '../types/index'
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { updateProject } from "@/features/user/userSlice";
import { setSession } from "@/features/session/sessionSlice"
import { useToast } from "@/hooks/use-toast"
import Axios from 'axios'
import OpenArrow from "@/assets/OpenArrow"
import { useNavigate } from "react-router-dom"

export default function ProjectEdit({ project }: { project: types.Project }) {
    const [prevProj, setPrevProj] = useState<types.Project>(project)
    const dispatch = useDispatch()
    const { toast } = useToast()
    const userId: string = useSelector((state: any) => state.userStore._id)
    const navigate = useNavigate()

    const handleSave = async () => {
        try {
            const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/project/update`, {
                ...prevProj,
                lastUpdatedBy: userId
            })

            if (response.status === 200) {
                dispatch(updateProject(response.data))
                setPrevProj(response.data)
            }
        } catch (err) {
            toast({
                description: 'There is some issue updating project details. Please try again.',
                variant: 'destructive'
            })
        }
    }


    const handleOpen = async () => {
        try {
            const res = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/session/get`, {
                projectId: project._id
            })

            if (res.status === 200) {
                dispatch(setSession({
                    _id: res.data._id,
                    participants: [userId],
                    project: project,
                    sessionFileTree: res.data.sessionFileTree,
                    currFile: { name: 'root', id: 'root', children: null }
                }))
                navigate(`/session/${res.data._id}`)
                toast({
                    description: "Joined existing session"
                })
            }
        } catch (err: any) {
            if (err.response?.status === 404) {
                console.log("Session not found");
                try {
                    const res2 = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/session/create`, {
                        project: project._id,
                        admin: userId
                    })
                    if (res2.status === 200 && res2.data) {
                        dispatch(setSession({
                            _id: res2.data._id,
                            participants: [userId],
                            project: project,
                            sessionFileTree: res2.data.sessionFileTree,
                            currFile: { name: 'root', id: 'root', children: null }
                        }))
                        navigate(`/session/${res2.data._id}`);
                        toast({
                            description: "Session created successfully"
                        })
                    }
                } catch (err2) {
                    console.log(err2)
                    toast({
                        description: 'There is some issue creating session for your project. Please try again.',
                        variant: 'destructive'
                    })
                }
            } else {
                console.log(err)
                toast({
                    description: 'There is some issue fetching prev session of your project. Please try again.',
                    variant: 'destructive'
                })
            }
        }
    }


    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <div className="flex flex-col gap-2 rounded-lg text-wrap border border-gray-500 bg-gray-800 p-4 hover:scale-105 hover:shadow-xl hover:shadow-white transition-all duration-300 cursor-pointer">
                        <div>{project.name}</div>
                        <div>{project.description}</div>
                        <div>{project.isPrivate}</div>
                    </div>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Edit project details</SheetTitle>
                        <SheetDescription>
                            Make changes to your project or start a collaborative session.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                        {Object.entries(prevProj).map(([key, value], idx) => {
                            return (
                                <div key={idx} className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">
                                        {key}
                                    </Label>
                                    <Input value={typeof value !== 'string' ? '' : value} className="col-span-3"
                                        onChange={(e) => {
                                            setPrevProj((prev: any) => ({
                                                ...prev,
                                                [key]: e.target.value
                                            }))
                                        }} />
                                </div>
                            )
                        })}
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="submit" onClick={handleOpen} className="bg-green-600 hover:bg-green-700">Open<OpenArrow /></Button>
                        </SheetClose>
                        <SheetClose asChild>
                            <Button type="submit" onClick={handleSave}>Save changes</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    )
}