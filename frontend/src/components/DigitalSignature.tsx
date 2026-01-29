import React, { useRef } from 'react';
import { Button } from 'antd';

const DigitalSignature = ({ onSign }) => {
  const canvasRef = useRef(null);

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onSign && onSign(dataUrl);
    }
  };

  return (
    <div className="digital-signature">
      <canvas ref={canvasRef} width={400} height={100} style={{ border: '1px solid #ccc' }} />
      <Button onClick={handleSign}>Save Signature</Button>
    </div>
  );
};

export default DigitalSignature;
