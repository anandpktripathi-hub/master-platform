import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { UploadCloud, X, Figma } from 'lucide-react';
import axios from 'axios';

interface FileImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (designJson: any) => void;
  tenantId: string;
}

const FileImportModal: React.FC<FileImportModalProps> = ({ open, onClose, onImport, tenantId }) => {
  const [tab, setTab] = useState<'zip' | 'figma'>('zip');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [figmaUrl, setFigmaUrl] = useState('');
  const [figmaToken, setFigmaToken] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', tenantId);
    const res = await axios.post('/api/cms/import/zip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    onImport(res.data);
    setUploading(false);
    onClose();
  };

  const importFigma = async () => {
    setUploading(true);
    try {
      const res = await axios.post('/api/cms/import/figma', {
        url: figmaUrl,
        token: figmaToken,
        tenantId,
      });
      onImport(res.data);
      onClose();
    } catch (error) {
      console.error('Error importing Figma file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={v => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-8 w-[400px] flex flex-col items-center gap-4">
          <button className="absolute top-2 right-2 p-1" onClick={onClose}><X size={20} /></button>
          <div className="flex gap-4 mb-4">
            <button className={`flex items-center gap-1 px-3 py-1 rounded ${tab==='zip'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('zip')}><UploadCloud size={16}/> ZIP</button>
            <button className={`flex items-center gap-1 px-3 py-1 rounded ${tab==='figma'?'bg-blue-100':'bg-gray-100'}`} onClick={()=>setTab('figma')}><Figma size={16}/> Figma</button>
          </div>
          {tab === 'zip' && (
            <>
              <h2 className="font-bold text-xl mb-2">Import ZIP (HTML/CSS/JS)</h2>
              <div
                className={`w-full h-32 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
              >
                <UploadCloud size={32} className="mb-2 text-blue-500" />
                <div className="text-gray-600 text-sm">Drag & drop ZIP file here<br />or click to select</div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </>
          )}
          {tab === 'figma' && (
            <>
              <h2 className="font-bold text-xl mb-2">Import Figma File</h2>
              <input
                className="w-full border rounded px-2 py-1 mb-2"
                placeholder="Figma File URL"
                value={figmaUrl}
                onChange={e => setFigmaUrl(e.target.value)}
              />
              <input
                className="w-full border rounded px-2 py-1 mb-2"
                placeholder="Figma Access Token"
                value={figmaToken}
                onChange={e => setFigmaToken(e.target.value)}
                type="password"
              />
              <button
                className="bg-blue-600 text-white px-4 py-1 rounded font-semibold hover:bg-blue-700 w-full"
                onClick={importFigma}
                disabled={!figmaUrl || !figmaToken || uploading}
              >{uploading ? 'Importing...' : 'Import Figma'}</button>
            </>
          )}
          {uploading && <div className="text-blue-600 font-semibold">Uploading...</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FileImportModal;
