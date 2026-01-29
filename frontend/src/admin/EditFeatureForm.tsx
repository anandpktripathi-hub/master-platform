import React, { useState } from 'react';
import { FeatureNode } from './FeatureManager';
import axios from 'axios';

interface EditFeatureFormProps {
  node: FeatureNode;
  onSubmit: (node: Partial<FeatureNode>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const EditFeatureForm: React.FC<EditFeatureFormProps> = ({ node, onSubmit, onCancel, onDelete }) => {
  const [name, setName] = useState(node.name);
  const [type, setType] = useState<FeatureNode['type']>(node.type);
  const [description, setDescription] = useState(node.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      description,
    });
  };

  return (
    <form className="feature-form" onSubmit={handleSubmit}>
      <h3>Edit Feature/Module</h3>
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
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="button" className="delete-btn" onClick={onDelete}>Delete</button>
      </div>
    </form>
  );
};

export default EditFeatureForm;
