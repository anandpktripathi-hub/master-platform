import React, { useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const WysiwygEditor: React.FC<WysiwygEditorProps> = ({ value, onChange }) => {
  const quillRef = useRef<any>(null);
  return (
    <div className="w-full bg-white rounded shadow p-2">
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={onChange}
        modules={{
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
            ['link', 'image', 'video', 'table'],
            ['clean']
          ],
          table: true,
          clipboard: { matchVisual: false },
        }}
        formats={[
          'header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
          'list', 'bullet', 'indent', 'link', 'image', 'video', 'table',
        ]}
        className="min-h-[200px]"
      />
    </div>
  );
};

export default WysiwygEditor;
