'use client';

import React, { useCallback, useState } from 'react';
import { validateAgentFile, getAgentFileType } from '@/lib/services/cloudflare';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react';

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  valid: boolean;
  error?: string;
  type: 'source' | 'config' | 'documentation' | 'dependency' | 'docker';
}

interface FileUploadZoneProps {
  onFilesChange: (files: FileWithPreview[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function FileUploadZone({ onFilesChange, maxFiles = 10, disabled = false }: FileUploadZoneProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithPreview[] = [];
    
    Array.from(fileList).forEach((file) => {
      // Ensure file has required properties
      if (!file || !file.name) {
        console.warn('Invalid file object:', file);
        return;
      }

      const validation = validateAgentFile(file);
      const fileType = getAgentFileType(file.name);
      
      const fileWithPreview: FileWithPreview = {
        ...file,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        valid: validation.valid,
        error: validation.error,
        type: fileType,
        // Ensure size is always a number
        size: typeof file.size === 'number' ? file.size : 0,
      };

      newFiles.push(fileWithPreview);
    });

    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [disabled, processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      processFiles(selectedFiles);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  }, [processFiles]);

  const removeFile = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    setFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'source': return 'bg-blue-100 text-blue-800';
      case 'docker': return 'bg-purple-100 text-purple-800';
      case 'config': return 'bg-green-100 text-green-800';
      case 'dependency': return 'bg-orange-100 text-orange-800';
      case 'documentation': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number | undefined) => {
    // Handle undefined, null, or invalid numbers
    if (bytes === undefined || bytes === null || isNaN(bytes) || bytes < 0) {
      return 'Unknown size';
    }
    
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Additional safety check for the calculation
    const size = bytes / Math.pow(k, i);
    if (isNaN(size) || !isFinite(size)) {
      return 'Unknown size';
    }
    
    return parseFloat(size.toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Zone */}
      <Card 
        className={`relative border-2 border-dashed transition-colors ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="p-8 text-center">
          <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              Drop agent files here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or{' '}
              <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                browse to upload
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".py,.js,.ts,.rs,.go,.java,.cpp,.c,.php,.txt,.md,.json,.yaml,.yml,.toml,.dockerfile"
                  onChange={handleFileInput}
                  disabled={disabled}
                />
              </label>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Supports Python, JavaScript, TypeScript, Rust, Go, Java, C/C++, and more. Max 10MB per file.
            </p>
          </div>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files ({files.length}/{maxFiles})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <File className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <Badge className={getFileTypeColor(file.type)}>
                          {file.type}
                        </Badge>
                        {file.valid ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                        {!file.valid && file.error && (
                          <p className="text-xs text-red-500">
                            {file.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* File Summary */}
      {files.length > 0 && (
        <div className="text-sm text-gray-600">
          {files.filter(f => f.valid).length} valid files, {files.filter(f => !f.valid).length} invalid files
        </div>
      )}
    </div>
  );
} 