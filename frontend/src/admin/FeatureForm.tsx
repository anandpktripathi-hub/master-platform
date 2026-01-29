import React, { useState } from 'react';
import { FeatureNode } from './FeatureManager';

interface FeatureFormProps {
  parentId?: string;
  onSubmit: (node: Omit<FeatureNode, 'children'>) => void;
  onCancel: () => void;
}

const FeatureForm: React.FC<FeatureFormProps> = ({ parentId, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<FeatureNode['type']>('feature');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name,
      type,
      enabled: true,
      description,
    });
  };

  return (
    <form className="feature-form" onSubmit={handleSubmit}>
      <h3>Add New {parentId ? 'Child' : 'Root'} Feature/Module</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <select value={type} onChange={e => setType(e.target.value as FeatureNode['type'])} title="Select feature type">
        <option value="module">Module</option>
        <option value="submodule">Submodule</option>
        <option value="feature">Feature</option>
        <option value="subfeature">Subfeature</option>
        <option value="option">Option</option>
        <option value="suboption">Suboption</option>
        <option value="point">Point</option>
        <option value="subpoint">Subpoint</option>
      </select>
      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div className="form-actions">
        <button type="submit">Add</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default FeatureForm;
