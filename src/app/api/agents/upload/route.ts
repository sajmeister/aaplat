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
    
    console.log('🔍 Form Data Debug:');
    console.log('- Form data entries count:', Array.from(formData.entries()).length);
    
    for (const [key, value] of formData.entries()) {
      console.log(`- Entry: ${key} = ${value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value}`);
      
      if (value instanceof File && value.size > 0) {
        console.log(`  📁 Processing file: ${value.name} (${value.size} bytes)`);
        
        // Validate each file
        const validation = validateAgentFile(value);
        console.log(`  ✅ Validation result: ${JSON.stringify(validation)}`);
        
        if (!validation.valid) {
          throw new ApiError(`Invalid file ${value.name}: ${validation.error}`, 400);
        }
        
        files[value.name] = value;
        console.log(`  ✅ File added to upload list: ${value.name}`);
      } else if (value instanceof File) {
        console.log(`  ⚠️ File ${value.name} skipped (size: ${value.size})`);
      }
    }

    console.log(`📊 Final file count: ${Object.keys(files).length}`);
    console.log(`📊 File names: ${Object.keys(files).join(', ')}`);

    if (Object.keys(files).length === 0) {
      // Return success even with no files - files are optional for now
      console.log('⚠️ No files provided, but continuing (files are optional)');
      return createSuccessResponse({
        agentId,
        files: {},
        message: 'Agent created successfully (no files uploaded - R2 storage not configured)',
      });
    }

    // Check if R2 is configured
    const r2Configured = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
                        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY && 
                        process.env.CLOUDFLARE_R2_BUCKET_NAME && 
                        process.env.CLOUDFLARE_R2_ENDPOINT;
    
    if (!r2Configured) {
      console.log('⚠️ Cloudflare R2 not configured, skipping file upload');
      console.log('- R2_ACCESS_KEY_ID:', !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID);
      console.log('- R2_SECRET_ACCESS_KEY:', !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY);
      console.log('- R2_BUCKET_NAME:', !!process.env.CLOUDFLARE_R2_BUCKET_NAME);
      console.log('- R2_ENDPOINT:', !!process.env.CLOUDFLARE_R2_ENDPOINT);
      
      return createSuccessResponse({
        agentId,
        files: { message: 'Files received but not uploaded (R2 storage not configured)' },
        message: `Files validated but not uploaded (${Object.keys(files).length} files) - R2 storage not configured`,
      });
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