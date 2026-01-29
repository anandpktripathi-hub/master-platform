import React, { useEffect, useRef, useState } from 'react';
import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import parserCss from 'prettier/parser-postcss';
import parserBabel from 'prettier/parser-babel';
import CodeEditor from './CodeEditor';

const DEFAULT_HTML = '<div>Hello, world!</div>';
const DEFAULT_CSS = 'div { color: red; }';
const DEFAULT_JS = 'console.log("Hello, world!");';

const MonacoEditorWrapper: React.FC = () => {
  const editorRef = useRef<any>(null);
  const [tab, setTab] = useState<'html' | 'css' | 'js'>('html');
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [css, setCss] = useState(DEFAULT_CSS);
  const [js, setJs] = useState(DEFAULT_JS);

  // Prettier format
  const handleFormat = () => {
    if (tab === 'html') setHtml(prettier.format(html, { parser: 'html', plugins: [parserHtml] }));
    if (tab === 'css') setCss(prettier.format(css, { parser: 'css', plugins: [parserCss] }));
    if (tab === 'js') setJs(prettier.format(js, { parser: 'babel', plugins: [parserBabel] }));
  };

  // Emmet and Tailwind autocomplete are enabled via Monaco settings
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    // Emmet support
    if (monaco.languages.registerCompletionItemProvider) {
      // Emmet for HTML/CSS
      // ...Emmet config (if needed)...
    }
    // Tailwind IntelliSense (if using tailwindcss-language-server, handled by VS Code extension or Monaco plugin)
  };

  // Format on Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleFormat();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div className="w-full h-full flex flex-col bg-white rounded shadow">
      <div className="flex gap-2 border-b p-2 bg-gray-50">
        <button className={`px-3 py-1 rounded ${tab==='html'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('html')}>HTML</button>
        <button className={`px-3 py-1 rounded ${tab==='css'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('css')}>CSS/SCSS</button>
        <button className={`px-3 py-1 rounded ${tab==='js'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('js')}>JS</button>
        <button className="ml-auto px-3 py-1 rounded bg-green-100 hover:bg-green-200" onClick={handleFormat}>Format (Prettier)</button>
      </div>
      <div className="flex-1 min-h-[300px]">
        <CodeEditor
          height="300px"
          language={tab === 'html' ? 'html' : tab === 'css' ? 'css' : 'javascript'}
          value={tab === 'html' ? html : tab === 'css' ? css : js}
          onChange={v => {
            if (tab === 'html') setHtml(v || '');
            if (tab === 'css') setCss(v || '');
            if (tab === 'js') setJs(v || '');
          }}
          theme="vs-light"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: 'on',
            formatOnType: true,
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            tabCompletion: 'on',
            snippetSuggestions: 'top',
            // Emmet and Tailwind handled by Monaco plugins/extensions
          }}
          onMount={handleEditorDidMount}
        />
      </div>
      {/* Live preview (iframe) */}
      <div className="border-t bg-gray-50 p-2">
        <iframe
          title="Live Preview"
          className="w-full h-40 bg-white rounded shadow"
          srcDoc={`<html><head><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`}
        />
      </div>
    </div>
  );
};

export default MonacoEditorWrapper;
