import { Editor } from "@monaco-editor/react";
import colors from '../util/colors'
import { useSelector } from "react-redux";


export default function CodeEditor({ handleEditorDidMount }: { handleEditorDidMount: any }) {
	const session = useSelector((state:any) => state.sessionStore)
	return (
		<div //className="pt-2"  
		style={{backgroundColor: colors.ideBg}}>
			<Editor
				key={session.trigger}
				options={{
					minimap: {
						enabled: false,
					},
				}}
				height="61.18vh"
				theme="vs-dark"
				language={session.language}
				onMount={handleEditorDidMount}
			/>
		</div>
	)
}