"use client"

import { useState, useCallback, useEffect, useId } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { fileTypes, FileType, UploadedFile } from "@/lib/file-types"
import { Download, RotateCw, Trash2, Paperclip } from "lucide-react"
import { getFileDownloadUrl } from "@/lib/supabase/files"

interface FileUploadProps {
  fileType: FileType
  onFileUploaded?: (file: UploadedFile) => void
  onFileCleared?: (fileTypeId: string) => void
  existingFile?: UploadedFile
  variant?: 'compact' | 'comfortable' // compact = horizontal for timeline, comfortable = vertical for grid
}

export function FileUpload({ fileType, onFileUploaded, onFileCleared, existingFile, variant = 'comfortable' }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | undefined>(existingFile)

  // Generate a unique ID for this component instance to avoid DOM conflicts
  // Use React's useId for SSR-safe unique IDs
  const reactId = useId()
  const uniqueId = `file-${fileType.id}-${reactId.replace(/:/g, '')}`

  // Sync local state with existingFile prop changes
  // BUT don't sync while actively uploading to prevent interference
  useEffect(() => {
    // Only sync if we're not currently uploading
    if (!isUploading) {
      setUploadedFile(existingFile)
    }
  }, [existingFile, isUploading])

  // Animate progress bar gradually when uploading
  useEffect(() => {
    if (isUploading) {
      setUploadProgress(0)

      // Simulate gradual progress over 0.75 seconds (2x faster)
      const duration = 750
      const interval = 50 // Update every 50ms
      const totalSteps = duration / interval
      let currentStep = 0

      const progressInterval = setInterval(() => {
        currentStep++
        const progress = Math.min((currentStep / totalSteps) * 95, 95) // Cap at 95% until completion
        setUploadProgress(progress)

        if (currentStep >= totalSteps) {
          clearInterval(progressInterval)
        }
      }, interval)

      return () => clearInterval(progressInterval)
    } else {
      setUploadProgress(0)
    }
  }, [isUploading])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
    // Reset the input value so the same file can be selected again
    e.target.value = ''
  }, [])

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)

    // Simulate upload delay (2x faster)
    await new Promise(resolve => setTimeout(resolve, 750))

    // Complete the progress bar to 100%
    setUploadProgress(100)

    // Brief pause to show 100% completion
    await new Promise(resolve => setTimeout(resolve, 100))

    // Create uploaded file object with actual file data
    const uploadedFile: UploadedFile = {
      id: Math.random().toString(36).substr(2, 9),
      fileTypeId: fileType.id,
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
      uploadedBy: "Nick",
      fileData: file, // Store the actual file
      isDemoFile: false // This is a user upload
    }

    setIsUploading(false)
    setUploadedFile(uploadedFile)
    onFileUploaded?.(uploadedFile)
  }

  const handleDownload = useCallback(async () => {
    const fileToDownload = uploadedFile || existingFile
    if (fileToDownload) {
      // If this file has a storage path, it's from Supabase - get the signed URL
      if (fileToDownload.storagePath && !fileToDownload.isDemoFile) {
        try {
          const downloadUrl = await getFileDownloadUrl(fileToDownload.storagePath)

          // Create a temporary link and trigger download
          const link = document.createElement('a')
          link.href = downloadUrl
          link.download = fileToDownload.fileName
          link.target = '_blank'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          return
        } catch (error) {
          console.error("Failed to download file from Supabase:", error)
          alert("Failed to download file. Please try again.")
          return
        }
      }

      // If this is a user-uploaded file with actual file data, download the original file
      if (fileToDownload.fileData && !fileToDownload.isDemoFile) {
        const url = URL.createObjectURL(fileToDownload.fileData)
        const link = document.createElement('a')
        link.href = url
        link.download = fileToDownload.fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        return
      }

      // For demo files, create appropriate dummy content
      let content = ''
      const mimeType = 'text/plain'

      if (fileToDownload.fileName.includes('Demo_Call_Transcript')) {
        content = `DEMO CALL TRANSCRIPT
Company: TechCorp
Date: January 10, 2024
Participants: Nick (GrowthLab), Sarah Johnson (TechCorp CTO)

Nick: Hi Sarah, thanks for taking the time to explore our automation solutions.

Sarah: Of course! We're really interested in streamlining our operations. Our current manual processes are taking too much time.

Nick: I understand. Let me walk you through how our AI-powered automation platform could help TechCorp reduce manual work by 80%.

[Transcript continues...]

Key takeaways:
- TechCorp processes 500+ invoices manually per month
- Current approval workflow takes 3-5 days
- Looking for integration with their existing ERP system
- Budget range: $10K-50K annually
- Decision timeline: Next quarter

Next steps:
- Schedule technical scoping call
- Provide detailed proposal
- Demo custom workflow builder`
      } else if (fileToDownload.fileName.includes('Readiness_Assessment')) {
        content = `READINESS ASSESSMENT REPORT
Company: TechCorp
Assessment Date: January 12, 2024
Assessor: Nick, GrowthLab

AUTOMATION READINESS SCORE: 85%

Technical Infrastructure:
✓ Cloud-based systems (AWS)
✓ API-accessible ERP (SAP)
✓ Modern tech stack
✓ Dedicated IT team

Process Maturity:
✓ Documented workflows
✓ Clear approval chains
✓ Regular process reviews
⚠ Some manual exceptions exist

Data Quality:
✓ Structured data formats
✓ Regular data audits
✓ Good data governance
⚠ Some legacy data cleanup needed

Change Management:
✓ Leadership buy-in
✓ Previous automation experience
✓ Training programs in place
⚠ Some resistance from accounting team

RECOMMENDATIONS:
1. Start with invoice processing automation
2. Implement gradual rollout approach
3. Provide additional training for accounting team
4. Establish success metrics and KPIs

ESTIMATED ROI: 300% within 12 months`
      } else {
        content = `DOCUMENT: ${fileToDownload.fileName}
Generated: ${new Date(fileToDownload.uploadDate).toLocaleDateString()}
Size: ${formatFileSize(fileToDownload.fileSize)}

This is a placeholder document for demonstration purposes.
In a real application, this would contain the actual file content.

Document Type: ${fileType.label}
Description: ${fileType.description}

For more information about this document, please contact the GrowthLab team.`
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileToDownload.fileName.replace('.pdf', '.txt')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }, [uploadedFile, existingFile, fileType])

  const triggerFileInput = useCallback(() => {
    const input = document.getElementById(uniqueId) as HTMLInputElement
    input?.click()
  }, [uniqueId])

  const handleClearFile = useCallback(() => {
    setUploadedFile(undefined)
    onFileCleared?.(fileType.id)
  }, [onFileCleared, fileType.id])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const displayFile = uploadedFile || existingFile
  const FileIcon = fileType.IconComponent

  if (displayFile) {
    return (
      <Card className="border-[#C8E4BB] bg-[#C8E4BB]/20">
        <CardContent className="p-4">
          {variant === 'compact' ? (
            // Compact horizontal layout for timeline
            <div className="flex items-start gap-4">
              <FileIcon className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{displayFile.fileName}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(displayFile.fileSize)} • Uploaded {new Date(displayFile.uploadDate).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-white hover:bg-gray-50"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="bg-white hover:bg-gray-50"
                >
                  <RotateCw className="w-4 h-4 mr-1.5" />
                  Replace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white"
                  onClick={handleClearFile}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Clear
                </Button>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id={uniqueId}
              />
            </div>
          ) : (
            // Comfortable vertical layout with stacked buttons
            <div className="space-y-3">
              {/* File info row - centered */}
              <div className="flex flex-col items-center justify-center gap-3 py-2">
                <FileIcon className="w-8 h-8 text-gray-700" />
                <div className="text-center w-full">
                  <h3 className="font-semibold text-gray-900 text-base mb-1" style={{ fontFamily: 'var(--font-heading)' }}>{fileType.label}</h3>
                  <p className="font-medium text-gray-800 truncate text-base px-2">{displayFile.fileName}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatFileSize(displayFile.fileSize)} • Uploaded {new Date(displayFile.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Button section - each button takes 50% width */}
              <div className="flex flex-col items-stretch gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="bg-white hover:bg-gray-50 w-1/2 mx-auto"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="bg-white hover:bg-gray-50 w-1/2 mx-auto"
                >
                  <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                  Replace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 bg-white w-1/2 mx-auto"
                  onClick={handleClearFile}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Clear
                </Button>
              </div>

              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id={uniqueId}
              />
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(
      "border-2 border-dashed transition-colors",
      isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
      isUploading && "border-primary bg-primary/5"
    )}>
      <CardContent
        className="p-6"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <FileIcon className="w-12 h-12 text-gray-600" />
          </div>
          <h3 className="font-medium mb-2">{fileType.label}</h3>
          <p className="text-sm text-muted-foreground mb-4">{fileType.description}</p>

          {isUploading ? (
            <div className="space-y-3">
              <div className="text-sm text-primary font-medium">
                Uploading... {Math.round(uploadProgress)}%
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Button className="w-full" type="button" onClick={triggerFileInput}>
                  <Paperclip className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground">
                  or drag and drop here
                </p>
              </div>
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id={uniqueId}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}