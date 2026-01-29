import React, { useState } from 'react';
import { Upload, Button, Input, Form, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import EmailTemplateEditor from '../components/EmailTemplateEditor';
import PreloaderBuilder from '../components/PreloaderBuilder';

const googleFonts = [
  // ...populate with 950+ Google Fonts via API or static list
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  // ...
];

const BrandingStudio = () => {
  const [form] = Form.useForm();
  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);
  const [preloader, setPreloader] = useState(null);
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');

  const handleUpload = (info, setter) => {
    if (info.file.status === 'done') {
      setter(info.file.originFileObj);
      message.success(`${info.file.name} uploaded successfully`);
    }
  };

  const onFinish = (values) => {
    // TODO: Upload assets to backend
    message.success('Branding updated!');
  };

  return (
    <div className="branding-studio">
      <h1>Branding Studio</h1>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Logo" name="logo">
          <Upload beforeUpload={() => false} onChange={info => handleUpload(info, setLogo)}>
            <Button icon={<UploadOutlined />}>Upload Logo</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Favicon" name="favicon">
          <Upload beforeUpload={() => false} onChange={info => handleUpload(info, setFavicon)}>
            <Button icon={<UploadOutlined />}>Upload Favicon</Button>
          </Upload>
        </Form.Item>
        <Form.Item label="Primary Color" name="primaryColor">
          <Input type="color" />
        </Form.Item>
        <Form.Item label="Secondary Color" name="secondaryColor">
          <Input type="color" />
        </Form.Item>
        <Form.Item label="Font Family" name="fontFamily">
          <Select options={googleFonts} showSearch filterOption />
        </Form.Item>
        <Form.Item label="Custom CSS" name="customCss">
          <Input.TextArea rows={3} onChange={e => setCustomCss(e.target.value)} />
        </Form.Item>
        <Form.Item label="Custom JS" name="customJs">
          <Input.TextArea rows={3} onChange={e => setCustomJs(e.target.value)} />
        </Form.Item>
        <Form.Item label="Preloader (Lottie)" name="preloader">
          <PreloaderBuilder onChange={setPreloader} />
        </Form.Item>
        <Form.Item label="Email Templates" name="emailTemplates">
          <EmailTemplateEditor />
        </Form.Item>
        <Button type="primary" htmlType="submit">Save Branding</Button>
      </Form>
    </div>
  );
};

export default BrandingStudio;
