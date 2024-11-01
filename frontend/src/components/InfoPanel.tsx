export default function InfoPanel({ user }: { user: string }) {
    return (
        <div className="flex flex-col justify-between border-2 border-red-400 w-3/4">
            <div>{`User : ${user}`}</div>
            {/* <div>Saving...</div> */}
        </div>
    )
}