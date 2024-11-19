import { Editor } from "@monaco-editor/react";

export default function CodeEditor({ handleEditorDidMount, trigger, language }: { handleEditorDidMount: any, trigger: any, language:any }) {

	return (
		<Editor
			key={trigger}
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