import { Editor } from "@monaco-editor/react";
import { useState } from 'react';

export default function CodeEditor() {
	const [code, setCode] = useState(`// Boilerplate code\n\n\n\n`);

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
			onChange={(val) => setCode(val || '')}
		/>
	)
}