import React from 'react';
import { useDrop } from 'react-dnd';

interface ColumnDropZoneProps {
  columnIdx: number;
  onDrop: (type: string, column: number) => void;
  isOver: boolean;
  children: React.ReactNode;
}

const ColumnDropZone: React.FC<ColumnDropZoneProps> = ({ columnIdx, onDrop, isOver, children }) => {
  const [{ isOverCurrent }, drop] = useDrop(() => ({
    accept: 'SECTION',
    drop: (item: { type: string }) => onDrop(item.type, columnIdx),
    collect: (monitor) => ({ isOverCurrent: monitor.isOver({ shallow: true }) }),
  }), [columnIdx]);

  return (
    <div
      ref={drop}
      className={`flex-1 flex flex-col gap-6 border border-dashed rounded-lg p-2 bg-white relative transition-all duration-150 ${isOverCurrent || isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
      style={{ minHeight: 120 }}
    >
      {children}
      {isOverCurrent && (
        <div className="absolute inset-0 bg-blue-100 opacity-30 pointer-events-none rounded-lg z-10" />
      )}
    </div>
  );
};

export default ColumnDropZone;
