import React, { useEffect, useState } from 'react';
import HierarchyApi, { HierarchyNode } from './HierarchyApi';

const nodeTypes = [
  'module', 'submodule', 'feature', 'subfeature', 'option', 'suboption', 'point', 'subpoint',
] as const;

type NodeType = typeof nodeTypes[number];

const HierarchyManager: React.FC = () => {
  const [tree, setTree] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<HierarchyNode>>({ type: 'module' });

  useEffect(() => {
    fetchTree();
  }, []);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const data = await HierarchyApi.getTree('module');
      setTree(data);
    } catch (err: any) {
      setError('Failed to load hierarchy tree');
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await HierarchyApi.create({ ...form, parent: selectedParent });
      setForm({ type: 'module' });
      setSelectedParent(null);
      fetchTree();
    } catch (err: any) {
      setError('Failed to create node');
    }
  };

  const renderTree = (nodes: HierarchyNode[], level = 0) => (
    <ul style={{ marginLeft: level * 20 }}>
      {nodes.map((node) => (
        <li key={node._id}>
          <span>
            <b>{node.name}</b> <i>({node.type})</i>
            <button onClick={() => setSelectedParent(node._id!)}>Add Child</button>
          </span>
          {node.children && node.children.length > 0 && renderTree(node.children as any, level + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <h2>Hierarchy Manager</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleCreate}>
        <input name="name" placeholder="Name" value={form.name || ''} onChange={handleInput} required />
        <select name="type" value={form.type} onChange={handleInput as any}>
          {nodeTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <textarea name="description" placeholder="Description" value={form.description || ''} onChange={handleInput} />
        <button type="submit">Create</button>
        {selectedParent && <span>Parent: {selectedParent}</span>}
      </form>
      {loading ? <div>Loading...</div> : renderTree(tree)}
    </div>
  );
};

export default HierarchyManager;
