import React, { useState } from 'react';
import { Menu, ChevronDown, Plus, Trash, GripVertical } from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  children?: MenuItem[];
  visibleTo?: string[];
}

const initialMenu: MenuItem[] = [
  { id: '1', label: 'Home', icon: 'home', url: '/', children: [] },
  { id: '2', label: 'About', icon: 'info', url: '/about', children: [] },
  { id: '3', label: 'Services', icon: 'layers', url: '/services', children: [
    { id: '3-1', label: 'Consulting', url: '/services/consulting', children: [] },
    { id: '3-2', label: 'Development', url: '/services/dev', children: [] },
  ] },
  { id: '4', label: 'Contact', icon: 'mail', url: '/contact', children: [] },
];

const MenuBuilder: React.FC = () => {
  const [menu, setMenu] = useState<MenuItem[]>(initialMenu);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Recursive render
  const renderMenu = (items: MenuItem[], level = 0) => (
    <ul className={`pl-${level * 4} flex flex-col gap-1`}>
      {items.map(item => (
        <li key={item.id} className={`flex items-center gap-2 p-1 rounded ${selectedId === item.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => setSelectedId(item.id)}>
          <GripVertical size={14} className="text-gray-400 cursor-move" />
          <span className="font-semibold flex items-center gap-1">
            <Menu size={16} /> {item.label}
          </span>
          <ChevronDown size={14} className="ml-auto" />
          <button className="p-1 hover:bg-red-100 rounded" onClick={e => { e.stopPropagation(); removeItem(item.id); }}><Trash size={14}/></button>
          {item.children && item.children.length > 0 && renderMenu(item.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  const removeItem = (id: string) => {
    const remove = (items: MenuItem[]): MenuItem[] => items.filter(i => i.id !== id).map(i => ({ ...i, children: i.children ? remove(i.children) : [] }));
    setMenu(prev => remove(prev));
  };

  return (
    <div className="w-full bg-white rounded shadow p-4">
      <div className="flex items-center gap-2 mb-2">
        <Menu size={20} />
        <span className="font-bold text-lg">Menu Builder</span>
        <button className="ml-auto bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-1"><Plus size={16}/>Add Item</button>
      </div>
      <div className="overflow-x-auto">
        {renderMenu(menu)}
      </div>
    </div>
  );
};

export default MenuBuilder;
