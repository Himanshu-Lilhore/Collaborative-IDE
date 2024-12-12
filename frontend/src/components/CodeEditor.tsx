import { Editor } from "@monaco-editor/react";
import colors from '../util/colors'


export default function CodeEditor({ handleEditorDidMount, trigger, language }: { handleEditorDidMount: any, trigger: any, language: any }) {

	return (
		<div //className="pt-2"  
		style={{backgroundColor: colors.ideBg}}>
			<Editor
				key={trigger}
				options={{
					minimap: {
						enabled: false,
					},
				}}
				height="61.18vh"
				theme="vs-dark"
				language={language}
				onMount={handleEditorDidMount}
			/>
		</div>
	)
}