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
    label: 'Scoping Prep Doc',
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
    label: 'Developer Audio Overview',
    description: 'Audio overview for development team',
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
    id: 'sprint-pricing-estimate',
    label: 'Sprint & Pricing Estimate',
    description: 'Sprint planning and pricing estimate document',
    acceptedTypes: ['.pdf', '.doc', '.docx', '.xlsx'],
    icon: '💰',
    category: 'planning'
  },
  {
    id: 'internal-scoping-doc',
    label: 'Internal Scoping Doc',
    description: 'Internal scoping document for team reference',
    acceptedTypes: ['.pdf', '.doc', '.docx'],
    icon: '📄',
    category: 'document'
  },
  {
    id: 'client-scoping-doc',
    label: 'Client Scoping Doc',
    description: 'Scoping document for client reference',
    acceptedTypes: ['.pdf', '.doc', '.docx'],
    icon: '📋',
    category: 'document'
  },
  {
    id: 'kickoff-meeting-brief',
    label: 'Kickoff Meeting Brief',
    description: 'Brief document for project kickoff meeting',
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