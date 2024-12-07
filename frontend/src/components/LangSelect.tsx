import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { languages } from 'monaco-editor';

export default function LangSelect({language, setLanguage}:{language: string, setLanguage:any}) {    
    const handleValueChange = (value: string) => {
        setLanguage(value)
        console.log(`Language set to ${value}`)
    };

    return (
        <Select onValueChange={handleValueChange}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language} />
            </SelectTrigger>
            <SelectContent>
                {
                    languages.getLanguages().map((lang: any) => {
                        if (!lang.id.startsWith('freemarker')) {
                            return <SelectItem key={lang.id} value={lang.id}>{lang.id}</SelectItem>
                        }
                    })
                }
            </SelectContent>
        </Select>
    )
}
