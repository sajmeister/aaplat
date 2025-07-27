'use client';

import React, { useState } from 'react';
import { CreateAgentInput } from '@/lib/validations/agent';
import { useCreateAgent } from '@/hooks/use-agents';
import { FileUploadZone } from './file-upload-zone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  valid: boolean;
  error?: string;
  type: 'source' | 'config' | 'documentation' | 'dependency' | 'docker';
}

interface CreateAgentFormProps {
  onSuccess?: (agentId: string) => void;
  onCancel?: () => void;
}

export function CreateAgentForm({ onSuccess, onCancel }: CreateAgentFormProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [debugData, setDebugData] = useState<{
    r2Config?: Record<string, unknown>;
    uploadResponse?: { status: number; result?: Record<string, unknown>; error?: Record<string, unknown> };
    fileDetails?: Array<{ name: string; size: number; type: string; valid: boolean; error?: string }>;
    errors?: string[];
  }>({});
  
  // Form state
  const [formData, setFormData] = useState<CreateAgentInput>({
    name: '',
    description: '',
    category: 'utilities',
    runtime: 'python',
    version: '1.0.0',
    isPublic: false,
  });

  const createAgentMutation = useCreateAgent();

  // Debug helpers
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const updateDebugData = (key: string, value: Record<string, unknown> | Array<Record<string, unknown>> | string[]) => {
    setDebugData(prev => ({ ...prev, [key]: value }));
  };

  const clearDebug = () => {
    setDebugLogs([]);
    setDebugData({});
  };

  const handleFilesChange = (newFiles: FileWithPreview[]) => {
    setFiles(newFiles);
    
    // Debug: Log file details
    addDebugLog(`📁 Files changed: ${newFiles.length} files`);
    
    // Debug each file individually
    newFiles.forEach((f, index) => {
      addDebugLog(`  📄 File ${index + 1}: "${f.name}" (${f.size} bytes, type: ${f.type}, valid: ${f.valid})`);
      if (!f.name) {
        addDebugLog(`    ⚠️ WARNING: File ${index + 1} has no name!`);
      }
      if (f.error) {
        addDebugLog(`    ❌ Error: ${f.error}`);
      }
    });
    
    const fileDetails = newFiles.map(f => ({
      name: f.name || 'MISSING_NAME',
      size: f.size,
      type: f.type,
      valid: f.valid,
      error: f.error
    }));
    updateDebugData('fileDetails', fileDetails);
  };

  const uploadFiles = async (agentId: string): Promise<void> => {
    addDebugLog(`🚀 Starting file upload for agent: ${agentId}`);
    addDebugLog(`📊 Files available: ${files.length}`);
    
    // Check and log R2 configuration status
    addDebugLog('🔍 Checking R2 environment variables...');
    
    if (files.length === 0) {
      addDebugLog('⚠️ No files to upload');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Preparing files...');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('agentId', agentId);
      addDebugLog(`📝 Added agentId to FormData: ${agentId}`);

      let validFileCount = 0;
      let invalidFileCount = 0;
      let emptyFileCount = 0;
      
      addDebugLog(`🔍 Frontend File Processing:`);
      addDebugLog(`  - Total files to process: ${files.length}`);
      
      files.forEach((file, index) => {
        addDebugLog(`🔍 Processing file ${index + 1}: "${file.name}" (valid: ${file.valid}, size: ${file.size}, type: ${file.type})`);
        
        // Check for missing file name
        if (!file.name) {
          addDebugLog(`  🚨 CRITICAL: File ${index + 1} has no name! Cannot add to FormData.`);
          invalidFileCount++;
          return;
        }
        
        if (file.size === 0) {
          emptyFileCount++;
          addDebugLog(`  ⚠️ File "${file.name}" is empty (0 bytes) - skipping`);
          return;
        }
        
        if (file.valid) {
          // Use filename as the key (not 'files')
          formDataUpload.append(file.name, file);
          addDebugLog(`  ✅ Added to FormData: key="${file.name}", file="${file.name}" (${file.size} bytes)`);
          validFileCount++;
        } else {
          invalidFileCount++;
          addDebugLog(`  ❌ Skipping invalid file: "${file.name}" - ${file.error}`);
        }
      });

      addDebugLog(`📊 Frontend File Summary:`);
      addDebugLog(`  - Total files: ${files.length}`);
      addDebugLog(`  - Valid files: ${validFileCount}`);
      addDebugLog(`  - Invalid files: ${invalidFileCount}`);
      addDebugLog(`  - Empty files: ${emptyFileCount}`);
      addDebugLog(`  - Files added to FormData: ${validFileCount}`);
      
      if (validFileCount === 0) {
        addDebugLog('⚠️ No valid files to upload');
        return;
      }

      setUploadProgress('Uploading to cloud storage...');
      addDebugLog('📤 Sending POST request to /api/agents/upload');

      const response = await fetch('/api/agents/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      addDebugLog(`📡 Upload response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const error = await response.json();
        addDebugLog(`❌ Upload failed: ${JSON.stringify(error)}`);
        updateDebugData('uploadResponse', { status: response.status, error });
        updateDebugData('errors', [error.error || 'Upload failed']);
        
        // Extract and display R2 configuration if available even in error case
        if (error.data?.r2Config) {
          addDebugLog('🔧 R2 Configuration Status (Error Case):');
          const r2Config = error.data.r2Config;
          addDebugLog(`  - ACCESS_KEY_ID: ${r2Config.CLOUDFLARE_R2_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET'}`);
          addDebugLog(`  - SECRET_ACCESS_KEY: ${r2Config.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET'}`);
          addDebugLog(`  - BUCKET_NAME: ${r2Config.CLOUDFLARE_R2_BUCKET_NAME ? '✅ SET' : '❌ NOT SET'} (${r2Config.bucketName})`);
          addDebugLog(`  - ENDPOINT: ${r2Config.CLOUDFLARE_R2_ENDPOINT ? '✅ SET' : '❌ NOT SET'} (${r2Config.endpoint})`);
          addDebugLog(`  - Overall Configured: ${r2Config.overallConfigured ? '✅ YES' : '❌ NO'}`);
          updateDebugData('r2Config', r2Config);
        }
        
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      addDebugLog(`✅ Upload successful: ${JSON.stringify(result)}`);
      updateDebugData('uploadResponse', { status: response.status, result });
      
      // Extract and display R2 configuration if available
      if (result.data?.r2Config) {
        addDebugLog('🔧 R2 Configuration Status:');
        const r2Config = result.data.r2Config;
        addDebugLog(`  - ACCESS_KEY_ID: ${r2Config.CLOUDFLARE_R2_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET'}`);
        addDebugLog(`  - SECRET_ACCESS_KEY: ${r2Config.CLOUDFLARE_R2_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET'}`);
        addDebugLog(`  - BUCKET_NAME: ${r2Config.CLOUDFLARE_R2_BUCKET_NAME ? '✅ SET' : '❌ NOT SET'} (${r2Config.bucketName})`);
        addDebugLog(`  - ENDPOINT: ${r2Config.CLOUDFLARE_R2_ENDPOINT ? '✅ SET' : '❌ NOT SET'} (${r2Config.endpoint})`);
        addDebugLog(`  - Overall Configured: ${r2Config.overallConfigured ? '✅ YES' : '❌ NO'}`);
        updateDebugData('r2Config', r2Config);
      }
      
      setUploadProgress('Upload complete!');
    } catch (error) {
      addDebugLog(`❌ File upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      updateDebugData('errors', [error instanceof Error ? error.message : 'Unknown error']);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages and debug
    setError('');
    setSuccess('');
    clearDebug();
    
    addDebugLog('🚀 Starting agent creation process');
    
    // Validation
    if (!formData.name.trim()) {
      setError('Please enter an agent name');
      return;
    }
    
    if (!formData.description?.trim()) {
      setError('Please enter an agent description');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress('Creating agent...');
      
      // Create the agent first
      const agent = await createAgentMutation.mutateAsync(formData);
      
      // Upload files if any
      if (files.length > 0) {
        setUploadProgress('Uploading files...');
        await uploadFiles(agent.id);
      }

      setUploadProgress('');
      setSuccess('Agent created successfully! 🎉 Check console for upload details. You can create another agent or go to dashboard.');
      
      // Don't redirect automatically - let user choose
      // setTimeout(() => {
      //   onSuccess?.(agent.id);
      // }, 10000);
      
    } catch (error: unknown) {
      console.error('Failed to create agent:', error);
      setUploadProgress('');
      
      // Better error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response?: { data?: { error?: string } } };
        if (responseError.response?.data?.error) {
          setError(`Failed to create agent: ${responseError.response.data.error}`);
        } else {
          setError('Failed to create agent. Please check your input and try again.');
        }
      } else if (error instanceof Error) {
        setError(`Failed to create agent: ${error.message}`);
      } else {
        setError('Failed to create agent. Please check your input and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validFiles = files.filter(f => f.valid);
  // Allow creating agents without files - files are optional
  const hasRequiredFiles = true; // Always allow submission since files are optional

  const runtimeOptions = [
    { value: 'python', label: 'Python', description: 'For AI/ML, data processing, automation' },
    { value: 'nodejs', label: 'Node.js', description: 'For web APIs, real-time applications' },
    { value: 'rust', label: 'Rust', description: 'For high-performance, systems programming' },
  ];

  const categoryOptions = [
    { value: 'automation', label: 'Automation', description: 'Task automation and workflows' },
    { value: 'data-processing', label: 'Data Processing', description: 'ETL, analytics, transformations' },
    { value: 'ai-ml', label: 'AI/ML', description: 'Machine learning and AI models' },
    { value: 'web-scraping', label: 'Web Scraping', description: 'Data extraction from websites' },
    { value: 'api-integration', label: 'API Integration', description: 'Connecting external services' },
    { value: 'monitoring', label: 'Monitoring', description: 'System and application monitoring' },
    { value: 'utilities', label: 'Utilities', description: 'General purpose tools' },
    { value: 'other', label: 'Other', description: 'Miscellaneous applications' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Debug Panel */}
      <Card className="p-4 border-purple-200 bg-purple-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-purple-800">🔍 Debug Panel</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDebug(!showDebug)}
            className="text-purple-700 border-purple-300"
          >
            {showDebug ? 'Hide' : 'Show'} Debug Info
          </Button>
        </div>
        
        {showDebug && (
          <div className="space-y-4">
            {/* Debug Logs */}
            <div>
              <h4 className="text-xs font-medium text-purple-700 mb-2">📝 Debug Logs:</h4>
              <div className="bg-gray-900 text-green-400 p-3 rounded-md max-h-48 overflow-y-auto font-mono text-xs">
                {debugLogs.length > 0 ? (
                  debugLogs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                ) : (
                  <div className="text-gray-500">No debug logs yet...</div>
                )}
              </div>
            </div>
            
            {/* Debug Data */}
            {Object.keys(debugData).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-purple-700 mb-2">📊 Debug Data:</h4>
                <div className="bg-gray-100 p-3 rounded-md max-h-48 overflow-y-auto">
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {/* Clear Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearDebug}
              className="text-purple-700 border-purple-300"
            >
              Clear Debug Info
            </Button>
          </div>
        )}
      </Card>

      {/* Progress Indicator */}
      {(isSubmitting || isUploading) && (
        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <p className="text-sm text-blue-800">
              {uploadProgress || 'Creating agent...'}
            </p>
          </div>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </Card>
      )}

      {/* Success Message */}
      {success && (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Create Another
              </Button>
              <Button 
                type="button"
                size="sm"
                onClick={() => onSuccess?.('dashboard')}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="My Awesome Agent"
                required
              />
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                placeholder="1.0.0"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what your agent does and how it works..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Runtime & Category */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Runtime Environment *</Label>
              <div className="mt-2 space-y-2">
                {runtimeOptions.map((runtime) => (
                  <label key={runtime.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="runtime"
                      value={runtime.value}
                      checked={formData.runtime === runtime.value}
                      onChange={(e) => setFormData({...formData, runtime: e.target.value as 'python' | 'nodejs' | 'rust'})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm">{runtime.label}</p>
                      <p className="text-xs text-gray-500">{runtime.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Category *</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {categoryOptions.map((category) => (
                  <label key={category.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={(e) => setFormData({...formData, category: e.target.value as CreateAgentInput['category']})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-gray-500">{category.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm">Make this agent public in the marketplace</span>
            </label>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Agent Files</h3>
            <div className="flex items-center space-x-2">
              {validFiles.length > 0 ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {validFiles.length} file{validFiles.length > 1 ? 's' : ''} ready
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-600">
                  Optional - Add files to deploy
                </Badge>
              )}
            </div>
          </div>
          
          <FileUploadZone 
            onFilesChange={handleFilesChange}
            disabled={isSubmitting || isUploading}
          />
          
          {files.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Tip:</strong> Make sure to include a main entry file (main.py, index.js, etc.) 
                and any configuration files your agent needs to run.
              </p>
            </div>
          )}
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting || isUploading}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading || !hasRequiredFiles}
            className="min-w-32"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Create Agent
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 