"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  ExternalLink,
  Calendar,
  User,
  FileText,
  Filter,
} from "lucide-react"
import {
  ContentItem,
  ContentType,
  contentTypeLabels,
  contentTypeColors,
} from "@/lib/marketing-content-types"

interface ContentLibraryProps {
  content: ContentItem[]
}

const contentTypeFilters: { value: ContentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'blog', label: 'Blogs' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'case_study', label: 'Case Studies' },
  { value: 'website_page', label: 'Website Pages' },
  { value: 'meeting_transcript', label: 'Transcripts' },
]

export function ContentLibrary({ content }: ContentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<ContentType | 'all'>('all')

  const filteredContent = content.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.keywords?.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = typeFilter === 'all' || item.type === typeFilter

    return matchesSearch && matchesType
  })

  const getTypeCount = (type: ContentType | 'all') => {
    if (type === 'all') return content.length
    return content.filter((c) => c.type === type).length
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search content by title, description, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex items-center gap-1 flex-wrap">
            {contentTypeFilters.map((filter) => (
              <Button
                key={filter.value}
                size="sm"
                variant={typeFilter === filter.value ? "default" : "outline"}
                onClick={() => setTypeFilter(filter.value)}
                className={
                  typeFilter === filter.value
                    ? "bg-[#407B9D] hover:bg-[#407B9D]/90"
                    : "hover:bg-slate-100"
                }
              >
                {filter.label}
                <span className="ml-1 text-xs opacity-70">
                  ({getTypeCount(filter.value)})
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Title
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Type
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Author
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Date
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-medium text-muted-foreground"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredContent.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b last:border-b-0 hover:bg-slate-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-medium text-[#463939] truncate"
                        style={{ fontFamily: 'var(--font-body)' }}
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p
                          className="text-sm text-muted-foreground truncate max-w-md"
                          title={item.description}
                        >
                          {item.description}
                        </p>
                      )}
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {item.keywords.slice(0, 2).map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs bg-slate-100"
                            >
                              {keyword}
                            </Badge>
                          ))}
                          {item.keywords.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{item.keywords.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={contentTypeColors[item.type]}>
                    {contentTypeLabels[item.type]}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {item.author ? (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="w-3.5 h-3.5" />
                      {item.author}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {item.dateCreated}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-md text-[#407B9D] hover:text-[#407B9D] hover:bg-[#407B9D]/10 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p
              className="text-muted-foreground"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              No content found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredContent.length} of {content.length} items
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setTypeFilter('all')
            }}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
