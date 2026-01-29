import React, { useRef, useState } from 'react';
import { Crop, Image as ImageIcon, Check, X } from 'lucide-react';

interface ImageEditorProps {
  src: string;
  onSave: (cropped: string) => void;
  onCancel: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel }) => {
  const [cropped, setCropped] = useState(src);
  // For demo: just preview/crop UI, real cropper can use react-easy-crop
  return (
    <div className="w-full bg-white rounded shadow p-4 flex flex-col items-center gap-4">
      <div className="w-64 h-64 bg-gray-100 flex items-center justify-center border rounded">
        <img src={cropped} alt="Edit" className="max-w-full max-h-full rounded" />
      </div>
      <div className="flex gap-2 mt-2">
        <button className="bg-green-600 text-white px-4 py-1 rounded flex items-center gap-1" onClick={()=>onSave(cropped)}><Check size={16}/>Save</button>
        <button className="bg-gray-200 px-4 py-1 rounded flex items-center gap-1" onClick={onCancel}><X size={16}/>Cancel</button>
      </div>
    </div>
  );
};

export default ImageEditor;
