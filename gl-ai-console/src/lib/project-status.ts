import { ProjectStatus, ProjectStatusInfo } from './supabase/types'

/**
 * Get display information for a project status
 * Uses GrowthLab brand colors where appropriate
 */
export function getProjectStatusInfo(status: ProjectStatus): ProjectStatusInfo {
  switch (status) {
    case 'active':
      return {
        status: 'active',
        displayName: 'Active',
        color: 'blue',
        icon: '' // No icon for active status
      }
    case 'not-a-fit':
      return {
        status: 'not-a-fit',
        displayName: 'Not a Fit',
        color: 'red',
        icon: '' // No emoji
      }
    case 'proposal-declined':
      return {
        status: 'proposal-declined',
        displayName: 'Proposal Declined',
        color: 'orange',
        icon: '' // No emoji
      }
    case 'onboarding-complete':
      return {
        status: 'onboarding-complete',
        displayName: 'Onboarding Complete',
        color: 'green',
        icon: '' // No emoji
      }
  }
}

/**
 * Get the display name for current stage based on project status
 */
export function getStageDisplayName(
  currentStage: string,
  projectStatus: ProjectStatus
): string {
  // For terminal statuses, return the status display name instead of stage
  if (projectStatus === 'not-a-fit') {
    return 'Not a Fit'
  }
  if (projectStatus === 'proposal-declined') {
    return 'Proposal Declined'
  }
  if (projectStatus === 'onboarding-complete') {
    return 'Onboarding Complete'
  }

  // For active projects, return the current stage as-is
  return currentStage
}

/**
 * Get CSS classes for status badge
 * Uses GrowthLab brand colors: #407B9D (blue), #C8E4BB (green), #95CBD7 (teal)
 */
export function getStatusBadgeClasses(status: ProjectStatus): string {
  const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all'

  switch (status) {
    case 'active':
      // Brand blue (#407B9D)
      return `${baseClasses} bg-[#407B9D]/10 text-[#407B9D] border border-[#407B9D]/20`
    case 'not-a-fit':
      // Muted red for archived/rejected status
      return `${baseClasses} bg-red-50 text-red-700 border border-red-200`
    case 'proposal-declined':
      // Warm orange for declined status
      return `${baseClasses} bg-orange-50 text-orange-700 border border-orange-200`
    case 'onboarding-complete':
      // Brand green (#C8E4BB) for success
      return `${baseClasses} bg-[#C8E4BB]/30 text-green-800 border border-[#C8E4BB]`
  }
}
