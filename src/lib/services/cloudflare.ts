import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';

// R2 Configuration
const R2_CONFIG = {
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
};

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

// Initialize S3 client for R2
const r2Client = new S3Client(R2_CONFIG);

// File upload types
export interface FileUploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface AgentFileStructure {
  sourceCode: string;
  dockerfile?: string;
  requirements?: string;
  config?: string;
  documentation?: string;
}

// Agent file management service
export class CloudflareR2Service {
  // Upload agent source code files
  static async uploadAgentFiles(
    agentId: string,
    files: { [key: string]: File | Buffer | string },
    userId: string
  ): Promise<AgentFileStructure> {
    const baseKey = `agents/${userId}/${agentId}`;
    const uploadedFiles: AgentFileStructure = {
      sourceCode: '',
    };

    try {
      for (const [fileName, fileContent] of Object.entries(files)) {
        const key = `${baseKey}/${fileName}`;
        const result = await this.uploadFile(key, fileContent);
        
        // Map files to structure
        if (fileName.includes('main.') || fileName.includes('index.') || fileName.includes('app.')) {
          uploadedFiles.sourceCode = result.key;
        } else if (fileName.toLowerCase().includes('dockerfile')) {
          uploadedFiles.dockerfile = result.key;
        } else if (fileName.includes('requirements.') || fileName.includes('package.json') || fileName.includes('Cargo.toml')) {
          uploadedFiles.requirements = result.key;
        } else if (fileName.includes('config.') || fileName.includes('.env')) {
          uploadedFiles.config = result.key;
        } else if (fileName.includes('readme') || fileName.includes('doc')) {
          uploadedFiles.documentation = result.key;
        }
      }

      return uploadedFiles;
    } catch (error) {
      console.error('Failed to upload agent files:', error);
      throw new Error(`Failed to upload agent files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload a single file
  static async uploadFile(
    key: string,
    content: File | Buffer | string,
    contentType?: string
  ): Promise<FileUploadResult> {
    try {
      let body: Buffer | string;
      let size: number;
      let finalContentType: string;

      if (content instanceof File) {
        body = Buffer.from(await content.arrayBuffer());
        size = content.size;
        finalContentType = content.type || contentType || 'application/octet-stream';
      } else if (Buffer.isBuffer(content)) {
        body = content;
        size = content.length;
        finalContentType = contentType || 'application/octet-stream';
      } else {
        body = content;
        size = Buffer.byteLength(content, 'utf8');
        finalContentType = contentType || 'text/plain';
      }

      const upload = new Upload({
        client: r2Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: finalContentType,
          Metadata: {
            uploadedAt: new Date().toISOString(),
          },
        },
      });

      const result = await upload.done();
      
      return {
        key,
        url: `https://${BUCKET_NAME}.${process.env.CLOUDFLARE_R2_ENDPOINT?.replace('https://', '')}//${key}`,
        size,
        contentType: finalContentType,
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get a signed URL for secure file access
  static async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      return await getSignedUrl(r2Client, command, { expiresIn });
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Download file content
  static async downloadFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await r2Client.send(command);
      
      if (!response.Body) {
        throw new Error('No file content received');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Failed to download file:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a file
  static async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await r2Client.send(command);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete all files for an agent
  static async deleteAgentFiles(agentId: string, userId: string): Promise<void> {
    try {
      const baseKey = `agents/${userId}/${agentId}`;
      
      // In a real implementation, you'd list all objects with the prefix and delete them
      // For now, we'll attempt to delete common file patterns
      const commonFiles = [
        'main.py', 'index.js', 'main.rs', 'app.py', 'index.ts',
        'Dockerfile', 'requirements.txt', 'package.json', 'Cargo.toml',
        'config.json', '.env', 'README.md'
      ];

      await Promise.allSettled(
        commonFiles.map(file => this.deleteFile(`${baseKey}/${file}`))
      );
    } catch (error) {
      console.error('Failed to delete agent files:', error);
      throw new Error(`Failed to delete agent files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Check if file exists
  static async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await r2Client.send(command);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get file metadata
  static async getFileMetadata(key: string) {
    try {
      const command = new HeadObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await r2Client.send(command);
      
      return {
        size: response.ContentLength,
        contentType: response.ContentType,
        lastModified: response.LastModified,
        metadata: response.Metadata,
      };
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Utility functions for file validation
export const validateAgentFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = [
    '.py', '.js', '.ts', '.rs', '.go', '.java', '.cpp', '.c', '.php',
    '.txt', '.md', '.json', '.yaml', '.yml', '.toml', '.dockerfile'
  ];

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(fileExtension) && !file.name.toLowerCase().includes('dockerfile')) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};

export const getAgentFileType = (fileName: string): 'source' | 'config' | 'documentation' | 'dependency' | 'docker' => {
  const name = fileName.toLowerCase();
  
  if (name.includes('dockerfile')) return 'docker';
  if (name.includes('requirements.') || name.includes('package.json') || name.includes('cargo.toml')) return 'dependency';
  if (name.includes('config.') || name.includes('.env')) return 'config';
  if (name.includes('readme') || name.includes('doc') || name.includes('.md')) return 'documentation';
  
  return 'source';
}; 