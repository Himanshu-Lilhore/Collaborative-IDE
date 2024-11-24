const langs = ['html', 'python', 'javascript', 'typescript'];

export default function InfoPanel({ user, language, setLanguage }: { user: string, language: any, setLanguage: any }) {
    return (
        <div className="flex flex-row justify-between items-center border-2 border-red-400 w-full">
            <div>{`USER : ${user}`}</div>
            {/* <div>Saving...</div> */}
            <div className="flex gap-4 flex-row">
                {
                    langs.map(lang =>
                        <button className={`border-2 rounded-md px-2 py-1 ${language===lang ? 'bg-orange-300' : 'bg-sky-300'}`} key={lang} onClick={() => setLanguage(lang)}>{lang}</button>
                    )
                }
            </div>
        </div>
    )
}