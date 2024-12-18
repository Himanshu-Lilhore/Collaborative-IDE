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
import RightArrow from "@/assets/RightArrow"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { updateProject } from "@/features/user/userSlice";
import { useToast } from "@/hooks/use-toast"
import Axios from 'axios'

export default function ProjectEdit({ project }: { project: types.Project }) {
    const [prevProj, setPrevProj] = useState<types.Project>(project)
    const dispatch = useDispatch()
    const { toast } = useToast()
    const userId = useSelector((state: any) => state.userStore._id)

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

    function handleEdit() {

    }

    return (
        <div>
            <Sheet>
                <SheetTrigger asChild>
                    <div className="flex flex-col gap-2 rounded-lg text-wrap border border-black bg-gray-200 p-4 hover:scale-105 hover:shadow-2xl hover:bg-gray-300 shadow-black transition-all duration-300 cursor-pointer">
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
                            <Button type="submit" onClick={handleEdit} className="bg-green-600 hover:bg-green-700 h-fit">Edit <RightArrow /></Button>
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