import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"

export default function PlaceHolder() {
    return (
        <>
            <Outlet />
            <Toaster />
        </>
    )
}