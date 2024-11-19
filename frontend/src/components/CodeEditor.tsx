import { Editor } from "@monaco-editor/react";
import { useState } from 'react';

export default function CodeEditor({ handleEditorDidMount }: { handleEditorDidMount: any }) {
	const [language] = useState('html');


	return (
		<Editor
			options={{
				minimap: {
					enabled: false,
				},
			}}
			height="75vh"
			theme="vs-dark"
			language={language}
			onMount={handleEditorDidMount}
		/>
	)
}