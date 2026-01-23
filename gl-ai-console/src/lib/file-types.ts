import { LucideIcon, Mic, BarChart3, ClipboardList, Target, FileText, RefreshCw, Rocket } from 'lucide-react'

export interface FileType {
  id: string
  label: string
  description: string
  acceptedTypes: string[]
  icon: string // Keep for backward compatibility
  IconComponent: LucideIcon
  category: 'call' | 'document' | 'planning' | 'technical'
}

export const fileTypes: FileType[] = [
  {
    id: 'demo-call-transcript',
    label: 'Demo Call Transcript',
    description: 'Transcript from the initial demo call. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '🎤',
    IconComponent: Mic,
    category: 'call'
  },
  {
    id: 'readiness-pdf',
    label: 'Readiness Assessment',
    description: 'Client readiness assessment document. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '📊',
    IconComponent: BarChart3,
    category: 'document'
  },
  {
    id: 'scoping-prep-doc',
    label: 'Scoping Call Prep',
    description: 'Preparation document for scoping call. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '📋',
    IconComponent: ClipboardList,
    category: 'planning'
  },
  {
    id: 'scoping-call-transcript',
    label: 'Scoping Call Transcript',
    description: 'Transcript from the scoping call. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '🎯',
    IconComponent: Target,
    category: 'call'
  },
  {
    id: 'developer-audio-overview',
    label: 'Developer Overview',
    description: 'Written overview document of project automation approach. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '📄',
    IconComponent: FileText,
    category: 'technical'
  },
  {
    id: 'workflow-description',
    label: 'N8N Workflow Description',
    description: 'Natural language description of the n8n workflow. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '🔄',
    IconComponent: RefreshCw,
    category: 'technical'
  },
  {
    id: 'internal-client-documentation',
    label: 'Scoping Document',
    description: 'Scoping document for team and client reference. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '📋',
    IconComponent: ClipboardList,
    category: 'document'
  },
  {
    id: 'ea-wording',
    label: 'EA Wording',
    description: 'Project-specific engagement agreement wording. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '📝',
    IconComponent: FileText,
    category: 'document'
  },
  {
    id: 'kickoff-meeting-brief',
    label: 'Kickoff Meeting Agenda',
    description: 'Agenda document for project kickoff meeting. Must be a .txt file.',
    acceptedTypes: ['.txt'],
    icon: '🚀',
    IconComponent: Rocket,
    category: 'planning'
  },
  {
    id: 'revops-demo-call-transcript',
    label: 'Demo Call Transcript',
    description: 'Transcript from the initial demo call (.txt only)',
    acceptedTypes: ['.txt'],
    icon: '🎤',
    IconComponent: Mic,
    category: 'call'
  }
]

export interface UploadedFile {
  id: string
  fileTypeId: string
  fileName: string
  uploadDate: string
  fileSize: number
  uploadedBy: string
  fileData?: File | Blob // Store the actual file data for user uploads
  isDemoFile?: boolean // Flag to identify demo files vs user uploads
  storagePath?: string // Supabase storage path for downloading files
}

export const getFileTypeById = (id: string): FileType | undefined => {
  return fileTypes.find(type => type.id === id)
}

export const getFilesByCategory = (category: FileType['category']): FileType[] => {
  return fileTypes.filter(type => type.category === category)
}