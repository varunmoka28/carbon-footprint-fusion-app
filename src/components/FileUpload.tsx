
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File, type: 'trips' | 'vehicles') => void;
  fileName: string | null;
  fileType: 'trips' | 'vehicles';
  title: string;
}

const FileUpload = ({ onFileUpload, fileName, fileType, title }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file, fileType);
    }
  };

  return (
    <div className="w-full">
      <p className="text-sm font-medium mb-2">{title}</p>
      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {fileName ? `Selected: ${fileName}` : `Drag 'n' drop or click to upload`}
        </p>
        <input
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".csv"
        />
      </div>
    </div>
  );
};

export default FileUpload;
