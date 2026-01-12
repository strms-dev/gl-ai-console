import { supabase } from './client'
import type { RevOpsPipelineFile, RevOpsPipelineFileInsert } from './types'

const STORAGE_BUCKET = 'revops-pipeline-files'

/**
 * Upload a file to Supabase Storage and create metadata record
 */
export async function uploadRevOpsFile(
  dealId: string,
  fileTypeId: string,
  file: File,
  uploadedBy: string = 'User'
): Promise<RevOpsPipelineFile> {
  // Create storage path: {dealId}/{fileTypeId}/{filename}
  const storagePath = `${dealId}/${fileTypeId}/${file.name}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: true // Replace if exists
    })

  if (uploadError) {
    console.error('Error uploading file to storage:', uploadError)
    throw new Error(`Failed to upload file: ${uploadError.message}`)
  }

  // Get public URL (or signed URL for private buckets)
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath)

  // Create metadata record
  const fileMetadata: RevOpsPipelineFileInsert = {
    deal_id: dealId,
    file_type_id: fileTypeId,
    file_name: file.name,
    file_path: urlData.publicUrl,
    file_size: file.size,
    uploaded_by: uploadedBy,
    storage_bucket: STORAGE_BUCKET,
    storage_path: storagePath
  }

  const { data, error } = await supabase
    .from('revops_pipeline_files')
    .insert(fileMetadata as never)
    .select()
    .single()

  if (error) {
    // If metadata insert fails, delete the uploaded file
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
    console.error('Error creating file metadata:', error)
    throw new Error(`Failed to create file metadata: ${error.message}`)
  }

  return data
}

/**
 * Get download URL for a file (signed URL for private buckets)
 */
export async function getRevOpsFileDownloadUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error) {
    console.error('Error getting download URL:', error)
    throw new Error(`Failed to get download URL: ${error.message}`)
  }

  return data.signedUrl
}

/**
 * Delete a file from storage and remove metadata
 */
export async function deleteRevOpsFile(fileId: string): Promise<void> {
  // First get the file metadata to know the storage path
  const { data: fileMetadata, error: fetchError } = await supabase
    .from('revops_pipeline_files')
    .select('storage_path, storage_bucket')
    .eq('id', fileId)
    .single() as { data: { storage_path: string, storage_bucket: string } | null, error: Error | null }

  if (fetchError || !fileMetadata) {
    console.error('Error fetching file metadata:', fetchError)
    throw new Error(`Failed to fetch file metadata: ${fetchError?.message || 'File not found'}`)
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(fileMetadata.storage_bucket)
    .remove([fileMetadata.storage_path])

  if (storageError) {
    console.error('Error deleting file from storage:', storageError)
    // Continue to delete metadata even if storage deletion fails
  }

  // Delete metadata
  const { error: deleteError } = await supabase
    .from('revops_pipeline_files')
    .delete()
    .eq('id', fileId)

  if (deleteError) {
    console.error('Error deleting file metadata:', deleteError)
    throw new Error(`Failed to delete file metadata: ${deleteError.message}`)
  }
}

/**
 * Replace an existing file (delete old, upload new)
 */
export async function replaceRevOpsFile(
  dealId: string,
  fileTypeId: string,
  newFile: File,
  uploadedBy: string = 'User'
): Promise<RevOpsPipelineFile> {
  // Find existing file for this deal and file type
  const { data: existingFiles, error: fetchError } = await supabase
    .from('revops_pipeline_files')
    .select('id')
    .eq('deal_id', dealId)
    .eq('file_type_id', fileTypeId) as { data: { id: string }[] | null, error: Error | null }

  if (fetchError) {
    console.error('Error fetching existing files:', fetchError)
  }

  // Delete all existing files of this type for this deal
  if (existingFiles && existingFiles.length > 0) {
    for (const file of existingFiles) {
      await deleteRevOpsFile(file.id)
    }
  }

  // Upload new file
  return uploadRevOpsFile(dealId, fileTypeId, newFile, uploadedBy)
}

/**
 * Get all files for a deal
 */
export async function getRevOpsDealFiles(dealId: string): Promise<RevOpsPipelineFile[]> {
  const { data, error } = await supabase
    .from('revops_pipeline_files')
    .select('*')
    .eq('deal_id', dealId)
    .order('uploaded_at', { ascending: false }) as { data: RevOpsPipelineFile[] | null, error: Error | null }

  if (error) {
    console.error('Error fetching deal files:', error)
    throw new Error(`Failed to fetch deal files: ${error.message}`)
  }

  return data || []
}

/**
 * Get a specific file by file type for a deal
 */
export async function getRevOpsFileByType(dealId: string, fileTypeId: string): Promise<RevOpsPipelineFile | null> {
  const { data, error } = await supabase
    .from('revops_pipeline_files')
    .select('*')
    .eq('deal_id', dealId)
    .eq('file_type_id', fileTypeId)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single() as { data: RevOpsPipelineFile | null, error: { code?: string, message?: string } | null }

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching file:', error)
    throw new Error(`Failed to fetch file: ${error.message || 'Unknown error'}`)
  }

  return data
}

/**
 * Delete all files of a specific type for a deal
 */
export async function deleteRevOpsFilesByType(dealId: string, fileTypeId: string): Promise<void> {
  // Get all files of this type
  const { data: files, error: fetchError } = await supabase
    .from('revops_pipeline_files')
    .select('id')
    .eq('deal_id', dealId)
    .eq('file_type_id', fileTypeId) as { data: { id: string }[] | null, error: Error | null }

  if (fetchError) {
    console.error('Error fetching files to delete:', fetchError)
    throw new Error(`Failed to fetch files: ${fetchError.message}`)
  }

  // Delete each file
  if (files && files.length > 0) {
    for (const file of files) {
      await deleteRevOpsFile(file.id)
    }
  }
}

/**
 * Delete all files and storage folder for a deal
 * Called when a deal is deleted
 */
export async function deleteRevOpsDealFiles(dealId: string): Promise<void> {
  try {
    // First, get all file metadata for this deal to know exact storage paths
    const { data: fileRecords, error: fetchError } = await supabase
      .from('revops_pipeline_files')
      .select('storage_path')
      .eq('deal_id', dealId) as { data: { storage_path: string }[] | null, error: Error | null }

    if (fetchError) {
      console.error('Error fetching deal file records:', fetchError)
    }

    // Delete files from storage using their exact paths from metadata
    if (fileRecords && fileRecords.length > 0) {
      const filePaths = fileRecords.map(record => record.storage_path)

      const { error: removeError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths)

      if (removeError) {
        console.error('Error removing deal files from storage:', removeError)
      }
    }

    // Also try to list and delete any files that might exist in storage but are not in metadata
    // List all subdirectories (file type folders) in the deal folder
    const { data: folders, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(dealId)

    if (listError) {
      console.error('Error listing deal folders in storage:', listError)
    } else if (folders && folders.length > 0) {
      // For each file type folder, list and delete files
      for (const folder of folders) {
        const { data: files, error: filesError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .list(`${dealId}/${folder.name}`)

        if (!filesError && files && files.length > 0) {
          const filePaths = files.map(file => `${dealId}/${folder.name}/${file.name}`)

          await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(filePaths)
        }
      }
    }

    // Delete file metadata from database
    // This should be handled by CASCADE on the database level,
    // but we do it explicitly to be safe
    const { error: metadataError } = await supabase
      .from('revops_pipeline_files')
      .delete()
      .eq('deal_id', dealId)

    if (metadataError) {
      console.error('Error deleting deal file metadata:', metadataError)
    }
  } catch (error) {
    console.error('Error in deleteRevOpsDealFiles:', error)
    // Do not throw - we want deal deletion to succeed even if file cleanup fails
  }
}
