import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Axios from 'axios'
import * as types from '../types/index'
import { useDispatch } from "react-redux";
import { updateUserField } from "@/features/user/userSlice";
import ProjectEdit from "./ProjectEdit";
Axios.defaults.withCredentials = true


export default function Projects() {
    const user = useSelector((state: any) => state.userStore)
    const [newProj, setNewProj] = useState({ name: '', description: '', isPrivate: true })
    const { toast } = useToast()
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const responses = await Promise.all(user.projects.map((project: string) => Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/project/get`, {
                    _id: project
                })))

                dispatch(updateUserField({ field: 'projects', value: [] })) // clearing projects array before updating
                let projects: types.Project[] = []
                responses.forEach((res: any) => {
                    projects.push(res.data)
                })
                dispatch(updateUserField({ field: 'projects', value: projects }))
            } catch (err) {
                toast({
                    description: 'There is some issue fetching the list of projects. Please try again.',
                    variant: 'destructive'
                })
            }
        }

        fetchAllProjects();
    }, [user.username])


    const handleCreate = async () => {
        try {
            const response = await Axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/project/create`, {
                ...newProj,
                owner: user.username
            })
            if (response.status === 200) {
                dispatch(updateUserField({ field: 'projects', value: [...user.projects, response.data] }))
            }
        } catch (err) {
            toast({
                description: 'There is some issue creating the project.',
                variant: 'destructive'
            })
        }
        setNewProj({ name: '', description: '', isPrivate: true })
    }


    return (
        <div>
            {/* Create project  */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>New Project</DialogTitle>
                        <DialogDescription>
                            Invite friends to debug your mess.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input id="name" placeholder="Clone for sure"
                                onChange={(e) => setNewProj(prev => ({ ...prev, name: e.target.value }))}
                                value={newProj.name}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right self-start pt-3">
                                Description
                            </Label>
                            <Textarea id="username" placeholder="Will this look good on my resume...?"
                                onChange={(e) => setNewProj(prev => ({ ...prev, description: e.target.value }))}
                                value={newProj.description}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-1" />
                            <div className="flex flex-row gap-2 items-center">
                                <Switch id="access"
                                    checked={newProj.isPrivate}
                                    onCheckedChange={() => setNewProj(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                                />
                                <Label htmlFor="access">Private</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="submit" onClick={handleCreate}>Create</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-row gap-2 flex-wrap">
                {user.projects.map((project: types.Project | string) => {
                    if (typeof project === "object")
                        return (
                            <ProjectEdit key={project._id} project={project} />
                        )
                })}
            </div>
        </div>
    );
}
