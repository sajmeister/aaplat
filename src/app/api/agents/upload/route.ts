import { NextRequest } from 'next/server';
import { CloudflareR2Service, validateAgentFile } from '@/lib/services/cloudflare';
import { 
  withAuth, 
  withErrorHandling, 
  createSuccessResponse, 
  ApiError
} from '@/lib/api-utils';

// Force Node.js runtime for better FormData handling
export const runtime = 'nodejs';

// POST /api/agents/upload - Upload agent files
export const POST = withErrorHandling(async (request: NextRequest) => {
  const session = await withAuth(request);
  
  // 🔐 Authorization check: Only allow "sajmeister" to upload files
  const allowedUser = 'sajmeister';
  const userName = session.user!.name!.toLowerCase();
  const userEmail = session.user!.email!.toLowerCase();
  
  const isAuthorized = userName.includes(allowedUser) || userEmail.includes(allowedUser);
  
  console.log('🔐 File upload authorization check:');
  console.log(`  - User: ${session.user!.name} (${session.user!.email})`);
  console.log(`  - Authorized: ${isAuthorized}`);
  
  if (!isAuthorized) {
    throw new ApiError('Access denied: Only authorized users can upload agent files', 403);
  }
  
  try {
    const formData = await request.formData();
    const agentId = formData.get('agentId') as string;
    
    if (!agentId) {
      throw new ApiError('Agent ID is required', 400);
    }

    // Collect all files from form data
    const files: { [key: string]: File } = {};
    
    console.log('🔍 Form Data Debug:');
    const allEntries = Array.from(formData.entries());
    console.log('- Form data entries count:', allEntries.length);
    console.log('- Raw entries:', allEntries.map(([key, value]) => ({
      key,
      valueType: value instanceof File ? 'File' : typeof value,
      fileName: value instanceof File ? value.name : 'N/A',
      fileSize: value instanceof File ? value.size : 'N/A'
    })));
    
    let fileCount = 0;
    let validFileCount = 0;
    let invalidFileCount = 0;
    let emptyFileCount = 0;
    
    for (const [key, value] of formData.entries()) {
      console.log(`- Entry: ${key} = ${value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value}`);
      
      if (value instanceof File) {
        fileCount++;
        console.log(`  📁 Processing file: ${value.name} (${value.size} bytes)`);
        
        if (value.size === 0) {
          emptyFileCount++;
          console.log(`  ⚠️ File ${value.name} skipped (empty file, size: 0)`);
          continue;
        }
        
        // Validate each file
        const validation = validateAgentFile(value);
        console.log(`  🔍 Validation result: ${JSON.stringify(validation)}`);
        
        if (!validation.valid) {
          invalidFileCount++;
          console.log(`  ❌ File ${value.name} failed validation: ${validation.error}`);
          throw new ApiError(`Invalid file ${value.name}: ${validation.error}`, 400);
        }
        
        files[value.name] = value;
        validFileCount++;
        console.log(`  ✅ File added to upload list: ${value.name}`);
      } else {
        console.log(`  ℹ️ Non-file entry: ${key} = ${value}`);
      }
    }
    
    console.log(`📊 File Processing Summary:`);
    console.log(`  - Total entries processed: ${Array.from(formData.entries()).length}`);
    console.log(`  - Files detected: ${fileCount}`);
    console.log(`  - Valid files: ${validFileCount}`);
    console.log(`  - Invalid files: ${invalidFileCount}`);
    console.log(`  - Empty files: ${emptyFileCount}`);
    console.log(`  - Final files object size: ${Object.keys(files).length}`);

    console.log(`📊 Final file count: ${Object.keys(files).length}`);
    console.log(`📊 File names: ${Object.keys(files).join(', ')}`);

    // Check if R2 is configured
    const r2Configured = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID && 
                        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY && 
                        process.env.CLOUDFLARE_R2_BUCKET_NAME && 
                        process.env.CLOUDFLARE_R2_ENDPOINT;
    
    // Create R2 config status for debugging
    const r2ConfigStatus = {
      CLOUDFLARE_R2_ACCESS_KEY_ID: !!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: !!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      CLOUDFLARE_R2_BUCKET_NAME: !!process.env.CLOUDFLARE_R2_BUCKET_NAME,
      CLOUDFLARE_R2_ENDPOINT: !!process.env.CLOUDFLARE_R2_ENDPOINT,
      overallConfigured: !!r2Configured, // Fix: Convert to boolean
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'NOT_SET',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT ? 
        process.env.CLOUDFLARE_R2_ENDPOINT.substring(0, 30) + '...' : 'NOT_SET'
    };
    
    console.log('🔍 R2 Configuration Status:', r2ConfigStatus);

    if (Object.keys(files).length === 0) {
      // Return success even with no files - files are optional for now
      console.log('⚠️ No files provided, but continuing (files are optional)');
      return createSuccessResponse({
        agentId,
        files: {},
        message: r2Configured 
          ? 'Agent created successfully (no files were uploaded - no valid files detected in request)'
          : 'Agent created successfully (no files uploaded - R2 storage not configured)',
        r2Config: r2ConfigStatus,
        debugInfo: {
          formDataEntryCount: allEntries.length,
          fileCount,
          validFileCount,
          invalidFileCount,
          emptyFileCount,
          rawEntries: allEntries.map(([key, value]) => ({
            key,
            valueType: value instanceof File ? 'File' : typeof value,
            fileName: value instanceof File ? value.name : 'N/A',
            fileSize: value instanceof File ? value.size : 'N/A'
          }))
        }
      });
    }
    
          if (!r2Configured) {
        console.log('⚠️ Cloudflare R2 not configured, skipping file upload');
        return createSuccessResponse({
          agentId,
          files: { message: 'Files received but not uploaded (R2 storage not configured)' },
          message: `Files validated but not uploaded (${Object.keys(files).length} files) - R2 storage not configured`,
          r2Config: r2ConfigStatus,
        });
      }

    // Upload files to R2
    console.log('🚀 R2 is configured - attempting file upload...');
    console.log(`📤 Uploading ${Object.keys(files).length} files to R2...`);
    
    try {
      const uploadResult = await CloudflareR2Service.uploadAgentFiles(
        agentId,
        files,
        session.user!.id!
      );

              console.log('✅ R2 upload successful:', uploadResult);
        
        return createSuccessResponse({
          agentId,
          files: uploadResult,
          message: `Successfully uploaded ${Object.keys(files).length} files to Cloudflare R2`,
          r2Config: r2ConfigStatus,
        });
    } catch (uploadError) {
      console.error('❌ R2 upload failed:', uploadError);
      
              // Fallback: Return success but indicate upload failed
        return createSuccessResponse({
          agentId,
          files: { error: 'Upload failed', details: uploadError instanceof Error ? uploadError.message : 'Unknown error' },
          message: `Agent created but file upload failed (${Object.keys(files).length} files) - ${uploadError instanceof Error ? uploadError.message : 'R2 upload error'}`,
          r2Config: r2ConfigStatus,
        });
    }

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