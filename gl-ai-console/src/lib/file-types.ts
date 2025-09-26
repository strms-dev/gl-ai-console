export interface FileType {
  id: string
  label: string
  description: string
  acceptedTypes: string[]
  icon: string
  category: 'call' | 'document' | 'planning' | 'technical'
}

export const fileTypes: FileType[] = [
  {
    id: 'demo-call-transcript',
    label: 'Demo Call Transcript',
    description: 'Transcript from the initial demo call',
    acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'],
    icon: '🎤',
    category: 'call'
  },
  {
    id: 'readiness-pdf',
    label: 'Readiness Assessment',
    description: 'Client readiness assessment document',
    acceptedTypes: ['.pdf'],
    icon: '📊',
    category: 'document'
  },
  {
    id: 'scoping-prep-doc',
    label: 'Scoping Prep',
    description: 'Preparation document for scoping call',
    acceptedTypes: ['.pdf', '.doc', '.docx'],
    icon: '📋',
    category: 'planning'
  },
  {
    id: 'scoping-call-transcript',
    label: 'Scoping Call Transcript',
    description: 'Transcript from the scoping call',
    acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'],
    icon: '🎯',
    category: 'call'
  },
  {
    id: 'developer-audio-overview',
    label: 'Developer Overview',
    description: 'Developer overview of project automation',
    acceptedTypes: ['.mp3', '.wav', '.m4a', '.pdf', '.doc', '.docx'],
    icon: '🎧',
    category: 'technical'
  },
  {
    id: 'workflow-description',
    label: 'N8N Workflow Description',
    description: 'Natural language description of the n8n workflow',
    acceptedTypes: ['.pdf', '.doc', '.docx', '.txt'],
    icon: '🔄',
    category: 'technical'
  },
  {
    id: 'internal-client-documentation',
    label: 'Internal & Client Scoping Document',
    description: 'Comprehensive scoping document for both internal team and client reference',
    acceptedTypes: ['.pdf', '.doc', '.docx'],
    icon: '📋',
    category: 'document'
  },
  {
    id: 'ea-wording',
    label: 'EA Wording',
    description: 'Project-specific engagement agreement wording',
    acceptedTypes: ['.txt', '.doc', '.docx', '.pdf'],
    icon: '📝',
    category: 'document'
  },
  {
    id: 'kickoff-meeting-brief',
    label: 'Kickoff Meeting Agenda',
    description: 'Agenda document for project kickoff meeting',
    acceptedTypes: ['.pdf', '.doc', '.docx'],
    icon: '🚀',
    category: 'planning'
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
}

export const getFileTypeById = (id: string): FileType | undefined => {
  return fileTypes.find(type => type.id === id)
}

export const getFilesByCategory = (category: FileType['category']): FileType[] => {
  return fileTypes.filter(type => type.category === category)
}