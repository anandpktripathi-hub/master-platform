import React, { useRef } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface Layer {
  id: string;
  label: string;
}

interface LayersPanelProps {
  layers: Layer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({ layers, selectedId, onSelect, onReorder, bringToFront, sendToBack }) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };
  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };
  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      onReorder(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  return (
    <aside className="w-56 bg-white rounded-lg shadow p-4 flex flex-col gap-2 overflow-y-auto max-h-[80vh]">
      <h3 className="font-bold text-lg mb-2">Layers</h3>
      <ul className="flex flex-col gap-1">
        {layers.map((layer, idx) => (
          <li
            key={layer.id}
            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer group ${selectedId === layer.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => onSelect(layer.id)}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragEnter={() => handleDragEnter(idx)}
            onDragEnd={handleDragEnd}
          >
            <GripVertical size={16} className="text-gray-400" />
            <span className="flex-1 text-xs font-semibold">{layer.label}</span>
            <button
              className="p-1 rounded hover:bg-blue-200"
              title="Bring to front"
              onClick={e => { e.stopPropagation(); bringToFront(layer.id); }}
            >
              <ArrowUp size={14} />
            </button>
            <button
              className="p-1 rounded hover:bg-blue-200"
              title="Send to back"
              onClick={e => { e.stopPropagation(); sendToBack(layer.id); }}
            >
              <ArrowDown size={14} />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default LayersPanel;
