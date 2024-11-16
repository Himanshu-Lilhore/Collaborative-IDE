import { Editor } from "@monaco-editor/react";
import { useState } from 'react';

export default function CodeEditor({code, setCode, setTrigger} : {code:string, setCode:any, setTrigger:any}) {
	const [language, setLanguage] = useState('html');

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

////////////////////////////////////////////////////

// import { Editor } from '@monaco-editor/react';
// import { useEffect, useRef, useState } from 'react';
// import { MonacoBinding } from 'y-monaco';
// import * as Y from 'yjs';

// interface CodeEditorProps {
//     setEditor: (editor: any) => void;
//     ytext: Y.Text;
//     provider: any;
// }

// const CodeEditor: React.FC<CodeEditorProps> = ({ setEditor, ytext, provider }) => {
//     const [language] = useState('javascript');
//     const editorRef = useRef<any>(null);

//     const handleEditorChange = (value: string | undefined) => {
//         // Yjs will synchronize this with other clients, so no need for manual insert/delete
//         if (value !== undefined && ytext.toString() !== value) {
//             ytext.delete(0, ytext.length);
//             ytext.insert(0, value);
//         }
//     };

//     const handleEditorDidMount = (editorInstance: any) => {
//         setEditor(editorInstance);
//         editorRef.current = editorInstance;
//         const model = editorInstance.getModel();

//         if (model) {
//             // Initialize MonacoBinding to handle Yjs collaboration
//             const binding = new MonacoBinding(ytext, model, new Set([editorInstance]), provider.awareness);

//             // Observe changes from other clients
//             ytext.observe((event) => {
//                 const editorContent = editorInstance.getValue();
//                 const ytextContent = ytext.toString();

//                 if (editorContent !== ytextContent) {
//                     editorInstance.setValue(ytextContent);
//                 }
//             });

//             const yTextObserver = () => {
//                 const editorContent = editorInstance.getValue();
//                 const ytextContent = ytext.toString();

//                 if (editorContent !== ytextContent) {
//                     editorInstance.setValue(ytextContent);
//                 }
//             };


//             // Cleanup
//             return () => {
//                 binding.destroy();
//                 ytext.unobserve(yTextObserver);
//             };
//         } else {
//             console.error("No model found for editor.");
//         }
//     };

//     return (
//         <Editor
//             height="80vh"
//             theme="vs-dark"
//             language={language}
//             defaultValue={ytext.toString()}  // Display initial content
//             onMount={handleEditorDidMount}   // Bind Yjs to Monaco when editor mounts
//             onChange={(value) => handleEditorChange(value ?? '')}  // Update Yjs when editor content changes
//             options={{
//                 minimap: { enabled: false },
//                 scrollBeyondLastLine: false,
//                 wordWrap: 'on',
//                 fontSize: 14,
//             }}
//         />
//     );
// };

// export default CodeEditor;
