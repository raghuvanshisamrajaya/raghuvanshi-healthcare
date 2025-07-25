'use client';

import { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (imageData: string) => void;
  currentImage?: string;
  className?: string;
}

export const ImageUploader = ({ onImageSelect, currentImage, className = '' }: ImageUploaderProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || '');

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearImage = () => {
    setPreview('');
    onImageSelect('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />
        
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-32 mx-auto rounded-lg object-cover"
            />
            <button
              onClick={clearImage}
              title="Remove image"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <label 
                htmlFor="image-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-500 font-medium"
              >
                Click to upload
              </label>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
        )}
      </div>
      
      {preview && (
        <div className="text-xs text-gray-500">
          <p className="font-medium">✓ Image converted to Base64 data</p>
          <p>No external hosting required - image embedded in database</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
