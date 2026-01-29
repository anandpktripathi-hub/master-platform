import { render, fireEvent } from '@testing-library/react';
import LogoUploader from './LogoUploader';

test('calls onUpload when file selected', () => {
  const onUpload = jest.fn();
  const { getByLabelText } = render(<LogoUploader onUpload={onUpload} />);
  const input = getByLabelText(/upload logo/i) as HTMLInputElement;
  const file = new File(['logo'], 'logo.png', { type: 'image/png' });
  fireEvent.change(input, { target: { files: [file] } });
  expect(onUpload).toHaveBeenCalledWith(file);
});
