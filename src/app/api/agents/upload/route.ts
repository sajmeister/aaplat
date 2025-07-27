import { NextRequest } from 'next/server';
import { CloudflareR2Service, validateAgentFile } from '@/lib/services/cloudflare';
import { 
  withAuth, 
  withErrorHandling, 
  createSuccessResponse, 
  ApiError
} from '@/lib/api-utils';

// POST /api/agents/upload - Upload agent files
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await withAuth(request);
  
  try {
    const formData = await request.formData();
    const agentId = formData.get('agentId') as string;
    
    if (!agentId) {
      throw new ApiError('Agent ID is required', 400);
    }

    // Collect all files from form data
    const files: { [key: string]: File } = {};
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        // Validate each file
        const validation = validateAgentFile(value);
        if (!validation.valid) {
          throw new ApiError(`Invalid file ${value.name}: ${validation.error}`, 400);
        }
        
        files[value.name] = value;
      }
    }

    if (Object.keys(files).length === 0) {
      throw new ApiError('No valid files provided', 400);
    }

    // Upload files to R2
    const uploadResult = await CloudflareR2Service.uploadAgentFiles(
      agentId,
      files,
      session.user!.id!
    );

    return createSuccessResponse({
      agentId,
      files: uploadResult,
      message: `Successfully uploaded ${Object.keys(files).length} files`,
    });

  } catch (error) {
    console.error('Agent upload error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to upload agent files', 500);
  }
});

// GET /api/agents/upload/[key] - Get signed URL for file access
export const GET = withErrorHandling(async (request: NextRequest) => {
  await withAuth(request);
  
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (!key) {
    throw new ApiError('File key is required', 400);
  }

  try {
    const signedUrl = await CloudflareR2Service.getSignedUrl(key, 3600); // 1 hour expiry
    
    return createSuccessResponse({
      url: signedUrl,
      expiresIn: 3600,
    });
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw new ApiError('Failed to generate file access URL', 500);
  }
}); 