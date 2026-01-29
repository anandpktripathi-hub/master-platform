import React, { useState } from 'react';
import { Button, Input, Select, Form } from 'antd';

const defaultTemplates = [
  { label: 'Welcome Email', value: 'welcome' },
  { label: 'Password Reset', value: 'reset' },
  // ...
];

const EmailTemplateEditor = ({ value, onChange }) => {
  const [selected, setSelected] = useState('welcome');
  const [content, setContent] = useState('');

  const handleTemplateChange = (val) => {
    setSelected(val);
    // TODO: Load template content for selected
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    onChange && onChange({ [selected]: e.target.value });
  };

  return (
    <div className="email-template-editor">
      <Form layout="vertical">
        <Form.Item label="Template">
          <Select options={defaultTemplates} value={selected} onChange={handleTemplateChange} />
        </Form.Item>
        <Form.Item label="Content">
          <Input.TextArea rows={8} value={content} onChange={handleContentChange} />
        </Form.Item>
        <Button type="primary">Save Template</Button>
      </Form>
    </div>
  );
};

export default EmailTemplateEditor;
