import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  onChange?: (code: { html: string; css: string; js: string }) => void;
}

const DEFAULT_HTML = '<!-- Start editing HTML here -->\n<div class="p-8 text-center">\n  <h1 class="text-3xl font-bold">Ultra CMS Monaco Editor</h1>\n  <p>Edit HTML, CSS, JS with live Tailwind preview!</p>\n</div>';
const DEFAULT_CSS = '/* Tailwind/SCSS supported */\nbody { background: #f9fafb; }';
const DEFAULT_JS = '// Write JS here';

const CodeEditor: React.FC<CodeEditorProps> = ({ initialHtml = DEFAULT_HTML, initialCss = DEFAULT_CSS, initialJs = DEFAULT_JS, onChange }) => {
  const [html, setHtml] = useState(initialHtml);
  const [css, setCss] = useState(initialCss);
  const [js, setJs] = useState(initialJs);
  const [tab, setTab] = useState<'html' | 'css' | 'js'>('html');

  const handleEditorChange = (value: string | undefined) => {
    if (tab === 'html') setHtml(value || '');
    if (tab === 'css') setCss(value || '');
    if (tab === 'js') setJs(value || '');
    onChange?.({ html: html, css: css, js: js });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded shadow">
      <div className="flex gap-2 border-b p-2 bg-gray-50">
        <button className={`px-3 py-1 rounded ${tab==='html'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('html')}>HTML</button>
        <button className={`px-3 py-1 rounded ${tab==='css'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('css')}>CSS/SCSS</button>
        <button className={`px-3 py-1 rounded ${tab==='js'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('js')}>JS</button>
      </div>
      <div className="flex-1 min-h-[300px]">
        <MonacoEditor
          height="300px"
          language={tab === 'html' ? 'html' : tab === 'css' ? 'css' : 'javascript'}
          value={tab === 'html' ? html : tab === 'css' ? css : js}
          onChange={handleEditorChange}
          theme="vs-light"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: 'on',
            formatOnType: true,
            formatOnPaste: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
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

export default CodeEditor;
