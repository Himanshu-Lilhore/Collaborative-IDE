import { Editor } from "@monaco-editor/react";
import { useState } from 'react';

export default function CodeEditor({code, setCode, setTrigger} : {code:string, setCode:any, setTrigger:any}) {
	const [language, setLanguage] = useState('javascript')

	function handleChange(val?: string) {
		setCode(val);
		setTrigger(new Date());
	}

	return (
		<Editor
			options={{
				minimap: {
					enabled: false,
				},
			}}
			height="75vh"
			theme="vs-dark"
			value={code}
			language={language}
			onChange={(val) => handleChange(val)}
		/>
	)
}