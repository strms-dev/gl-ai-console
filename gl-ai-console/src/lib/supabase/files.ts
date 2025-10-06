import { supabase } from './client'
import type { ProjectFile, ProjectFileInsert } from './types'

const STORAGE_BUCKET = 'strms-project-files'

/**
 * Upload a file to Supabase Storage and create metadata record
 */
export async function uploadFile(
  projectId: string,
  fileTypeId: string,
  file: File,
  uploadedBy: string = 'User'
): Promise<ProjectFile> {
  // Create storage path: {projectId}/{fileTypeId}/{filename}
  const storagePath = `${projectId}/${fileTypeId}/${file.name}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
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
  const fileMetadata: ProjectFileInsert = {
    project_id: projectId,
    file_type_id: fileTypeId,
    file_name: file.name,
    file_path: urlData.publicUrl,
    file_size: file.size,
    uploaded_by: uploadedBy,
    storage_bucket: STORAGE_BUCKET,
    storage_path: storagePath
  }

  const { data, error } = await supabase
    .from('strms_project_files')
    .insert(fileMetadata)
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
export async function getFileDownloadUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
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
export async function deleteFile(fileId: string): Promise<void> {
  // First get the file metadata to know the storage path
  const { data: fileMetadata, error: fetchError } = await supabase
    .from('strms_project_files')
    .select('storage_path, storage_bucket')
    .eq('id', fileId)
    .single()

  if (fetchError) {
    console.error('Error fetching file metadata:', fetchError)
    throw new Error(`Failed to fetch file metadata: ${fetchError.message}`)
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
    .from('strms_project_files')
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
export async function replaceFile(
  projectId: string,
  fileTypeId: string,
  newFile: File,
  uploadedBy: string = 'User'
): Promise<ProjectFile> {
  // Find existing file for this project and file type
  const { data: existingFiles, error: fetchError } = await supabase
    .from('strms_project_files')
    .select('id')
    .eq('project_id', projectId)
    .eq('file_type_id', fileTypeId)

  if (fetchError) {
    console.error('Error fetching existing files:', fetchError)
  }

  // Delete all existing files of this type for this project
  if (existingFiles && existingFiles.length > 0) {
    for (const file of existingFiles) {
      await deleteFile(file.id)
    }
  }

  // Upload new file
  return uploadFile(projectId, fileTypeId, newFile, uploadedBy)
}

/**
 * Get all files for a project
 */
export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const { data, error } = await supabase
    .from('strms_project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  if (error) {
    console.error('Error fetching project files:', error)
    throw new Error(`Failed to fetch project files: ${error.message}`)
  }

  return data || []
}

/**
 * Get a specific file by file type for a project
 */
export async function getFileByType(projectId: string, fileTypeId: string): Promise<ProjectFile | null> {
  const { data, error } = await supabase
    .from('strms_project_files')
    .select('*')
    .eq('project_id', projectId)
    .eq('file_type_id', fileTypeId)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching file:', error)
    throw new Error(`Failed to fetch file: ${error.message}`)
  }

  return data
}

/**
 * Delete all files of a specific type for a project
 */
export async function deleteFilesByType(projectId: string, fileTypeId: string): Promise<void> {
  // Get all files of this type
  const { data: files, error: fetchError } = await supabase
    .from('strms_project_files')
    .select('id')
    .eq('project_id', projectId)
    .eq('file_type_id', fileTypeId)

  if (fetchError) {
    console.error('Error fetching files to delete:', fetchError)
    throw new Error(`Failed to fetch files: ${fetchError.message}`)
  }

  // Delete each file
  if (files && files.length > 0) {
    for (const file of files) {
      await deleteFile(file.id)
    }
  }
}

/**
 * Get the upload date for a specific file type
 * Returns the uploaded_at timestamp
 */
export async function getFileUploadDate(projectId: string, fileTypeId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('strms_project_files')
    .select('uploaded_at')
    .eq('project_id', projectId)
    .eq('file_type_id', fileTypeId)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No file uploaded yet
      return null
    }
    console.error('Error getting file upload date:', error)
    return null
  }

  return data?.uploaded_at || null
}
