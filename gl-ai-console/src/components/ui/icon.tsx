import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IconProps {
  icon: LucideIcon
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'brand-blue' | 'brand-green' | 'brand-teal' | 'success' | 'error' | 'warning' | 'inherit'
}

const sizeMap = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

const colorMap = {
  'brand-blue': 'text-[#407B9D]',
  'brand-green': 'text-[#C8E4BB]',
  'brand-teal': 'text-[#95CBD7]',
  'success': 'text-green-600',
  'error': 'text-red-600',
  'warning': 'text-orange-600',
  'inherit': ''
}

export function Icon({ icon: LucideIcon, size = 'md', className, color = 'inherit' }: IconProps) {
  return (
    <LucideIcon
      className={cn(
        sizeMap[size],
        colorMap[color],
        className
      )}
    />
  )
}
