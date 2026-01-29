import React, { useState } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const PreloaderBuilder = ({ onChange }) => {
  const [lottie, setLottie] = useState(null);

  const handleUpload = (info) => {
    if (info.file.status === 'done') {
      setLottie(info.file.originFileObj);
      onChange && onChange(info.file.originFileObj);
    }
  };

  return (
    <div className="preloader-builder">
      <Upload beforeUpload={() => false} onChange={handleUpload} accept=".json">
        <Button icon={<UploadOutlined />}>Upload Lottie JSON</Button>
      </Upload>
      {lottie && <span>{lottie.name}</span>}
    </div>
  );
};

export default PreloaderBuilder;
